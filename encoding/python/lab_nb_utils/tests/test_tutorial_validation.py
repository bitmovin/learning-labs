import os
import uuid
from unittest import TestCase

import lab_nb_utils.config as cfg
import tutorial


class TestTutorialValidator(TestCase):
    def setUp(self) -> None:
        self.tu = tutorial.TutorialHelper(printer="print")

    def test_validate(self):
        cfg.API_KEY = os.environ.get("BITMOVIN_API_KEY")
        self.tu.validate()

    def test__validate_apikey(self):
        cfg.API_KEY = ""
        with self.assertRaises(ValueError) as context:
            self.tu._reload_config()
            self.tu._validate_api_key()
        self.assertIn("not defined the API_KEY",
                      context.exception.args[0])

        cfg.API_KEY = "fsdfs"
        with self.assertRaises(ValueError) as context:
            self.tu._reload_config()
            self.tu._validate_api_key()
        self.assertIn("API_KEY should be a UUID",
                      context.exception.args[0])

        cfg.API_KEY = str(uuid.uuid4())
        with self.assertRaises(ValueError) as context:
            self.tu._reload_config()
            self.tu._validate_api_key()
        self.assertIn("not recognized",
                      context.exception.args[0])

        cfg.API_KEY = os.environ['BITMOVIN_API_KEY']
        self.tu._reload_config()
        self.tu._validate_api_key()

    def test__validate_orgid_invalid_inputs(self):
        cfg.API_KEY = os.environ.get('BITMOVIN_API_KEY')

        cfg.ORG_ID = "fsdfs"
        with self.assertRaises(ValueError) as context:
            self.tu._reload_config()
            self.tu._validate_org_id()
        self.assertIn("ORG_ID should be a UUID",
                      context.exception.args[0])

        cfg.ORG_ID = str(uuid.uuid4())
        with self.assertRaises(ValueError) as context:
            self.tu._reload_config()
            self.tu._validate_org_id()
        self.assertIn("not have permissions",
                      context.exception.args[0])

    def test__validate_orgid_not_a_tenant(self):
        cfg.API_KEY = os.environ.get("VALID_USER_API_KEY")
        cfg.ORG_ID = os.environ.get("ORG_USER_IS_NOT_TENANT_OF")
        self.tu._reload_config()
        self.tu._validate_api_key()
        with self.assertRaises(ValueError) as context:
            self.tu._validate_org_id()
        self.assertIn("not have permissions",
                      context.exception.args[0])

    def test__validate_orgid_all_valid(self):
        cfg.API_KEY = os.environ.get("BITMOVIN_API_KEY")
        cfg.ORG_ID = os.environ.get("BITMOVIN_ORG_ID")
        self.tu._reload_config()
        self.tu._validate_org_id()

    def test_validate_ll_orgid(self):
        cfg.API_KEY = os.environ.get("BITMOVIN_API_KEY")
        cfg.ORG_ID = "6f754aa8-fd27-4102-b539-52f1f9c26818"
        self.tu._reload_config()
        self.tu._validate_org_id()

    def test__validate_label(self):
        cfg.MY_LABEL = "bla di bla"
        self.tu._reload_config()
        l = self.tu._validate_label()
        self.assertEqual(l, "BlaDiBla")

        cfg.MY_LABEL = "bladibla"
        self.tu._reload_config()
        l = self.tu._validate_label()
        self.assertEqual(l, "bladibla")

        cfg.MY_LABEL = "I like > 1039 $%^&*"
        self.tu._reload_config()
        l = self.tu._validate_label()
        self.assertEqual(l, "ILike1039")

        cfg.MY_LABEL = ""
        self.tu._reload_config()
        l = self.tu._validate_label()
        self.assertNotEqual(l, "")

    def test__validate_output(self):
        cfg.OUTPUT_ID = "0d40af80-4f66-40a6-87b0-ed33b590f4a2"
        with self.assertRaises(ValueError) as context:
            self.tu._reload_config()
            self.tu._validate_output()
        self.assertIn("invalid or is not a resource",
                      context.exception.args[0])

        cfg.API_KEY = os.environ.get("BITMOVIN_API_KEY")
        cfg.ORG_ID = os.environ.get("BITMOVIN_ORG_ID")
        self.tu._reload_config()
        self.tu._validate_org_id()
        cfg.OUTPUT_ID = "2974359b-dd11-4645-b3ec-593e4e877e8e"
        self.tu._reload_config()
        self.tu._validate_output()
