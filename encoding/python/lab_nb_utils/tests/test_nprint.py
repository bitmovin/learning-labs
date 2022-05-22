from unittest import TestCase
import tutorial_printer

class TestManifestBuilder(TestCase):
    def setUp(self) -> None:
        self.nprint = nprint.TutorialPrinter(output_type="print")

    def test_build_msg(self):
        out = self.nprint._build_msg(msg="Hello")
        self.assertEqual(out, "Hello")

        out = self.nprint._build_msg(msg="Hello {d}", vars=dict(d=9))
        self.assertEqual(out, "Hello 9")

        out = self.nprint._build_msg(msg="Hello {d} {r}", vars=dict(d=9))
        self.assertEqual(out, "Hello 9 {r}")

        out = self.nprint._build_msg(msg="Hello {d} {r}", vars=dict(d=9, r="aa"))
        self.assertEqual(out, "Hello 9 aa")

        out = self.nprint._build_msg(msg="Hello {d} {r}", vars=dict(d=9), codevars=dict(r="yyu"))
        self.assertEqual(out, "Hello 9 <code>yyu</code>")


    def test_text(self):
        out = self.nprint.text("Hello world")
        self.assertEqual(out, "Hello world")

        out = self.nprint.text("Hello {c}", codevars=dict(c="coucou"))
        self.assertEqual(out, "Hello <code>coucou</code>")

        out = self.nprint.text("Hello {c}", codevars=dict(c="coucou"), bold=True)
        self.assertEqual(out, "<b>Hello <code>coucou</code></b>")


    def test_resource(self):
        class Resource:
            def __init__(self, id, name):
                self.id = id
                self.name = name

        obj = Resource(id="bli", name="bla")

        out = self.nprint.info_rest_operation("Here is it", obj)
        self.assertEqual(out, "Here is it <b><font color='blue'>Resource</font></b> - <b><code>bli</code>"
                              "</b>&nbsp;&nbsp;<font color='cadetblue'>[ bla ]</font>")

