import os
from unittest import TestCase

import bitmovin_api_sdk.encoding.encoding_api

import config as cfg
import tutorial
# from tutorial import nprint_patch
import bitmovin_api_sdk as bm


class TestTutorialHelper(TestCase):
    def setUp(self) -> None:
        self.tu = tutorial.TutorialHelper(printer="print")

    def test_get_dashboard_url(self):
        cfg.API_KEY = "abcde"
        cfg.ORG_ID = "mnopq"
        url = self.tu.get_dashboard_url(bm.Encoding(id_="1234567"))
        self.assertEqual(url,
                         "https://bitmovin.com/dashboard/encoding/encodings/1234567?apiKey=abcde&orgId=mnopq")

    def test_resource(self):
        cfg.API_KEY = os.environ.get("BITMOVIN_API_KEY")
        # self.tu.validate(output=False)

        api = bm.BitmovinApi(api_key=os.environ.get("BITMOVIN_API_KEY"),
                             logger=self.tu.api_logger)
        api.encoding.encodings.get("29fd03e2-8e6e-4c61-bf10-b2e1ae099e7a")

    def test_dashboard_link(self):
        cfg.API_KEY = "abcde"
        cfg.ORG_ID = "mnopq"
        self.tu.add_dashboard_link(bm.Encoding(id_="1234567"))

    def test_monkey_patch(self):
        cfg.API_KEY = os.environ.get("BITMOVIN_API_KEY")
        self.tu.validate(output=False)
        bm.ApiClient.request = self.tu.nprint_patch(bm.ApiClient.request, self.tu.printer)

        self.tu.api.encoding.encodings.get("29fd03e2-8e6e-4c61-bf10-b2e1ae099e7a")

    def test_logger(self):
        api = bm.BitmovinApi(api_key=os.environ.get("BITMOVIN_API_KEY"),
                             logger=bm.BitmovinApiLogger())
        api.encoding.encodings.list()
