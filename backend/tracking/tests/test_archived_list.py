"""Listado de guías archivadas para el panel."""

from tracking.tests.test_api import BASE, NUMBER, OTHER, GuideAPIFixture


class ArchivedListTests(GuideAPIFixture):
    def create_two_and_archive_one(self):
        self.create()
        self.payload["trackingNumber"] = OTHER
        self.create()
        self.assertEqual(self.client.delete(BASE + NUMBER + "/").status_code, 204)

    def numbers(self, response):
        self.assertEqual(response.status_code, 200)
        return [guide["trackingNumber"] for guide in response.data["results"]]

    def test_archived_list_only_returns_archived_guides(self):
        self.create_two_and_archive_one()
        self.assertEqual(self.numbers(self.client.get(BASE, {"archived": "true"})), [NUMBER])

    def test_default_list_keeps_excluding_archived_guides(self):
        self.create_two_and_archive_one()
        self.assertEqual(self.numbers(self.client.get(BASE)), [OTHER])

    def test_archived_list_requires_staff(self):
        self.create_two_and_archive_one()
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get(BASE, {"archived": "true"}).status_code, 403)
        self.client.force_authenticate(None)
        self.assertIn(self.client.get(BASE, {"archived": "true"}).status_code, (401, 403))
