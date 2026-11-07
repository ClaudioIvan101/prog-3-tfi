"""Dependency-free checks for the factory's local contracts and dashboard."""

import json
from pathlib import Path
import re
import subprocess
import tomllib
import unittest


ROOT = Path(__file__).resolve().parents[2]
ROLES = {"spec-writer", "builder", "security", "ux", "ui", "code", "approver"}


class FactoryContractTests(unittest.TestCase):
    def test_agents_are_native_codex_roles(self):
        paths = list((ROOT / ".codex/agents").glob("*.toml"))
        agents = [tomllib.loads(path.read_text(encoding="utf-8")) for path in paths]
        self.assertEqual({agent["name"] for agent in agents}, ROLES)
        self.assertEqual(len(agents), len(ROLES))
        for agent in agents:
            with self.subTest(agent=agent["name"]):
                expected_model = "gpt-6.1-sol" if agent["name"] == "builder" else "gpt-6.1-terra"
                self.assertEqual(agent["model"], expected_model)
                self.assertTrue(agent["description"].strip())
                self.assertTrue(agent["developer_instructions"].strip())

    def test_skill_links_resolve_without_external_services(self):
        for relative in (".codex/skills/factory/SKILL.md", ".agents/skills/factory/SKILL.md"):
            path = ROOT / relative
            content = path.read_text(encoding="utf-8")
            self.assertTrue(content.startswith("---\n"))
            self.assertIn("name: factory\n", content)
            for target in re.findall(r"\]\(([^)]+)\)", content):
                with self.subTest(skill=relative, target=target):
                    self.assertNotIn("://", target)
                    self.assertTrue((path.parent / target.split("#")[0]).resolve().is_file())

    def test_board_is_durable_json_with_safe_job_ids(self):
        board = json.loads((ROOT / "factory/board.json").read_text(encoding="utf-8"))
        self.assertIsInstance(board["jobs"], list)
        ids = []
        for job in board["jobs"]:
            self.assertRegex(job["id"], r"^\d{3,}-[a-z0-9]+(?:-[a-z0-9]+)*$")
            self.assertEqual(job["branch"], f"factory/{job['id']}")
            ids.append(job["id"])
        self.assertEqual(len(ids), len(set(ids)))

    def test_dashboard_behavior(self):
        result = subprocess.run(
            ["node", "--test", "factory/tests/dashboard.test.mjs"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
