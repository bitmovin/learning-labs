from bitmovin_api_sdk.common.bitmovin_api_logger_base import BitmovinApiLoggerBase


class TutorialApiLogger(BitmovinApiLoggerBase):
    def __init__(self):
        # type: () -> None
        self.last_method = None
        self.last_url = None
        self.last_payload = None
        self.last_response = None

    def log(self, message, data=None):
        # type: (str, object) -> None

        if message.startswith("REQUEST"):
            args = message.split(" ")
            self.last_method = args[1]
            self.last_url = args[2]
            try:
                self.last_payload = " ".join(args[5:])
            except:
                self.last_payload = None

        if message.startswith("RESPONSE"):
            self.last_response = message.replace("RESPONSE: ", '')

    def error(self, message, data=None):
        # type: (str, object) -> None

        print(f"ERROR [message={message}] [data={data}]")


