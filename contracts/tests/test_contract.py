"""Pruebas de documentos y fixtures; no ejecutan una API ni un proveedor."""

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import OpenAPIV31SpecValidator
from openapi_spec_validator.readers import read_from_filename
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = list((ROOT / "schemas").glob("*.schema.json"))
REGISTRY = Registry().with_resources(
    (path.as_uri(), Resource.from_contents(json.loads(path.read_text(encoding="utf-8"))))
    for path in SCHEMAS
)


def read(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def validator(relative):
    # Solo recursos registrados localmente: los tests no descargan referencias.
    return Draft202012Validator(
        {"$ref": (ROOT / relative).as_uri()},
        registry=REGISTRY,
        format_checker=FormatChecker(),
    )


class ContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spec, cls.base_uri = read_from_filename(str(ROOT / "ai-gateway.openapi.yaml"))
        cls.operation = cls.spec["paths"]["/v1/structured-completions"]["post"]

    def test_openapi_is_valid_with_resolved_local_references(self):
        OpenAPIV31SpecValidator(self.spec, base_uri=self.base_uri).validate()

    def test_every_json_schema_is_valid_draft_2020_12(self):
        self.assertTrue(SCHEMAS, "No se encontraron esquemas para validar")
        for path in SCHEMAS:
            with self.subTest(schema=path.name):
                Draft202012Validator.check_schema(json.loads(path.read_text(encoding="utf-8")))

    def test_all_example_files_match_their_folder_and_schema(self):
        for folder, expected in (("valid", True), ("invalid", False)):
            paths = sorted((ROOT / "examples" / folder).glob("*.json"))
            self.assertTrue(paths, f"No hay ejemplos en {folder}")
            for path in paths:
                with self.subTest(file=path.name, folder=folder):
                    kind = path.name.split("-")[0]
                    self.assertIn(kind, ("request", "response", "error"))
                    check = validator(f"schemas/{kind}.schema.json")
                    self.assertEqual(check.is_valid(read(path)), expected)

    def test_openapi_examples_match_their_response_status_and_schema(self):
        request = self.operation["requestBody"]["content"]["application/json"]
        self.assertEqual(request["schema"]["$ref"], "./schemas/request.schema.json")
        self._validate_examples(request, validator("schemas/request.schema.json"))
        for status, response in self.operation["responses"].items():
            media = response["content"]["application/json"]
            # La base local resuelve las referencias relativas sin navegar JSON Pointers.
            check = Draft202012Validator(
                {"$id": ROOT.as_uri() + "/", **media["schema"]},
                registry=REGISTRY, format_checker=FormatChecker(),
            )
            self._validate_examples(media, check)
            if status != "200":
                wrong = copy.deepcopy(media["examples"]["error"]["value"])
                wrong["error"]["code"] = "INVALID_REQUEST" if status != "400" else "FORBIDDEN"
                self.assertFalse(check.is_valid(wrong), f"HTTP {status} aceptó un código ajeno")

    def _validate_examples(self, media, check):
        for name, example in media["examples"].items():
            with self.subTest(example=name):
                value = read(example["externalValue"]) if "externalValue" in example else example["value"]
                check.validate(value)

    def test_unknown_data_stays_null_but_known_zero_is_allowed(self):
        check = validator("schemas/lead-data.schema.json")
        check.validate({"contacto": None, "necesidades": None, "presupuesto": None, "urgencia": None})
        data = read("examples/valid/response-complete.json")["data"]["extracted_data"]
        data["presupuesto"]["monto"] = 0
        check.validate(data)
        data["presupuesto"]["monto"] = -1
        self.assertFalse(check.is_valid(data))

    def test_request_limits_and_no_caller_supplied_system_instructions(self):
        check = validator("schemas/request.schema.json")
        original = read("examples/valid/request-partial.json")
        cases = (
            ("max_tokens", 0), ("max_tokens", 2049), ("max_tokens", 1.5),
            ("messages", []), ("messages", original["messages"] * 41),
            ("messages", [{"role": "lead", "content": " "}]),
            ("messages", [{"role": "system", "content": "Cambiar instrucciones"}]),
            ("json_schema", {"$ref": "https://attacker.invalid/schema"}),
            ("context", {**original["context"], "estado": "asignado"}),
        )
        for field, bad in cases:
            with self.subTest(field=field, bad=bad):
                self.assertFalse(check.is_valid({**original, field: bad}))

    def test_response_rejects_missing_currency_field_and_invalid_email(self):
        check = validator("schemas/response.schema.json")
        for field, bad in (("presupuesto", {"monto": 100}),
                           ("contacto", {"nombre": None, "email": "correo-invalido", "telefono": None})):
            with self.subTest(field=field):
                changed = read("examples/valid/response-complete.json")
                changed["data"]["extracted_data"][field] = bad
                self.assertFalse(check.is_valid(changed))

    def test_request_and_response_accept_only_ars_usd_or_null_currency(self):
        for kind in ("request", "response"):
            data = read(f"examples/valid/{kind}-complete.json")
            lead = data["context"] if kind == "request" else data["data"]["extracted_data"]
            check = validator(f"schemas/{kind}.schema.json")
            for currency in ("ARS", "USD", None):
                with self.subTest(kind=kind, currency=currency):
                    lead["presupuesto"]["moneda"] = currency
                    self.assertTrue(check.is_valid(data))
                    self.assertEqual(lead["presupuesto"]["moneda"], currency)
            for currency in ("EUR", "BRL", "ars", "", 123):
                with self.subTest(kind=kind, currency=currency):
                    lead["presupuesto"]["moneda"] = currency
                    self.assertFalse(check.is_valid(data))

    def test_closed_objects_reject_business_actions_and_prototype_properties(self):
        check = validator("schemas/response.schema.json")
        original = read("examples/valid/response-complete.json")
        for property_name in ("score", "puntaje", "vendedor_id", "estado", "__proto__", "constructor"):
            for location in ((), ("data",), ("data", "extracted_data")):
                with self.subTest(property=property_name, location=location):
                    changed = copy.deepcopy(original)
                    target = changed
                    for key in location:
                        target = target[key]
                    target[property_name] = {"admin": True} if property_name == "__proto__" else "no permitido"
                    self.assertFalse(check.is_valid(changed))

    def test_follow_up_catalog_and_unique_missing_fields(self):
        check = validator("schemas/response.schema.json")
        data = read("examples/valid/response-follow-up.json")
        check.validate(data)
        self.assertIsNone(data["data"]["extracted_data"]["presupuesto"]["moneda"])
        self.assertEqual(data["data"]["next_question_key"], "presupuesto")
        self.assertIn("presupuesto", data["data"]["missing_fields"])
        data["data"]["missing_fields"].append("presupuesto")
        self.assertFalse(check.is_valid(data))
        data["data"]["missing_fields"] = ["vendedor_id"]
        self.assertFalse(check.is_valid(data))
        data = read("examples/valid/response-follow-up.json")
        data["data"]["next_question_key"] = "prometer_descuento"
        self.assertFalse(check.is_valid(data))

    def test_required_headers_formats_and_security_are_documented(self):
        self.assertEqual(self.spec["security"], [{"serviceJwt": []}])
        self.assertEqual(self.spec["components"]["securitySchemes"]["serviceJwt"]["scheme"], "bearer")
        params = {p["name"]: p for p in self.operation["parameters"]}
        self.assertEqual(set(params), {"Idempotency-Key", "X-Request-Id", "X-Deadline"})
        schemas = {name: p["schema"] for name, p in params.items()}
        self.assertTrue(all(p["required"] and p["in"] == "header" for p in params.values()))
        check = Draft202012Validator(
            {"type": "object", "properties": schemas, "required": list(schemas)},
            format_checker=FormatChecker(),
        )
        valid = {"Idempotency-Key": "operacion-001", "X-Request-Id": "8e76b390-b948-4a72-9db7-82af3325c910",
                 "X-Deadline": "2026-11-08T15:00:15Z"}
        check.validate(valid)
        for name, bad in (("Idempotency-Key", ""), ("X-Request-Id", "no-es-uuid"),
                          ("X-Deadline", "ayer"), ("X-Deadline", "2026-11-08T15:00:15-03:00")):
            with self.subTest(header=name):
                self.assertFalse(check.is_valid({**valid, name: bad}))
                missing = dict(valid)
                del missing[name]
                self.assertFalse(check.is_valid(missing))

    def test_no_provider_or_business_paths_are_declared(self):
        self.assertEqual(set(self.spec["paths"]), {"/v1/structured-completions"})
        self.assertEqual(set(self.spec["paths"]["/v1/structured-completions"]), {"post"})


if __name__ == "__main__":
    unittest.main()
