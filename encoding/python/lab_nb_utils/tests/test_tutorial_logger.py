import os
from unittest import TestCase

import bitmovin_api_sdk as bm
import tutorial_logger


class TestTutorialLogger(TestCase):

    def test_base(self):
        tutologger = tutorial_logger.TutorialApiLogger()
        api = bm.BitmovinApi(api_key=os.environ.get("BITMOVIN_API_KEY"),
                             logger=tutologger)

        api.encoding.encodings.get("29fd03e2-8e6e-4c61-bf10-b2e1ae099e7a")
        self.assertEqual(tutologger.last_method, "GET")
        self.assertEqual(tutologger.last_url, "https://api.bitmovin.com/v1/encoding/encodings/29fd03e2-8e6e-4c61-bf10-b2e1ae099e7a")
        self.assertEqual(tutologger.last_payload, '')
        self.assertEqual(tutologger.last_response[0], '{')

        api.encoding.encodings.create(encoding=bm.Encoding(name="Coucou"))
        self.assertEqual(tutologger.last_method, "POST")
        self.assertEqual(tutologger.last_url, "https://api.bitmovin.com/v1/encoding/encodings")
        self.assertEqual(tutologger.last_payload[0], '{')
        self.assertEqual(tutologger.last_response[0], '{')
