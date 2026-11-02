"""Ciudades públicas verificadas y búsqueda de guías desde HTTP."""

from rest_framework.test import APIClient

from tracking.models import Guide, Stage, StageTransitionAttempt, StatusHistory
from tracking.tests.test_api import BASE, NUMBER, OTHER, GuideAPIFixture

CITIES = (
    "Laredo, Texas",
    "Nuevo Laredo, Tamaulipas",
    "Miami, Florida",
    "Monterrey, Nuevo León",
    "Guadalajara, Jalisco",
    "Ciudad de México",
    "Bogotá, Colombia",
    "São Paulo, Brasil",
    "Santiago, Chile",
    "Buenos Aires, Argentina",
)


class LocationAndSearchTests(GuideAPIFixture):
    def test_each_allowed_city_is_persisted_and_visible_publicly(self):
        public = APIClient()
        for index, city in enumerate(CITIES):
            with self.subTest(city=city):
                number = f"21{index + 1000:014d}"
                self.payload["trackingNumber"] = number
                self.create()
                response = self.client.put(
                    BASE + number + "/",
                    {
                        "stage": Stage.VEHICLE_LOADED,
                        "location": city,
                    },
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data["history"][-1]["location"], city)
                guide = Guide.objects.get(tracking_number=number)
                self.assertEqual(guide.current_stage, Stage.VEHICLE_LOADED)
                self.assertEqual(guide.status_history.count(), 2)
                self.assertEqual(guide.status_history.latest("pk").location, city)
                response = public.get("/api/v1/public/track/", {"numbers": number})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data[0]["history"][-1]["location"], city)
        self.assertEqual(
            (Guide.objects.count(), StatusHistory.objects.count()), (len(CITIES), 2 * len(CITIES))
        )

    def test_unknown_city_rejected_without_advancing_or_inserting(self):
        self.create()
        before = Guide.objects.get().updated_at
        response = self.client.put(
            BASE + NUMBER + "/",
            {
                "stage": Stage.VEHICLE_LOADED,
                "location": "Dirección privada 123",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"], "validation_error")
        self.assertIsInstance(response.data["detail"], str)
        guide = Guide.objects.get()
        self.assertEqual((guide.current_stage, guide.updated_at), (Stage.CARGO_RECEIVED, before))
        self.assertEqual(
            (StatusHistory.objects.count(), StageTransitionAttempt.objects.count()), (1, 0)
        )

    def test_location_remains_optional(self):
        self.create()
        for stage, extra in [
            (Stage.VEHICLE_LOADED, {}),
            (Stage.VEHICLE_RELEASED, {"location": ""}),
        ]:
            response = self.client.put(BASE + NUMBER + "/", {"stage": stage, **extra})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(StatusHistory.objects.latest("pk").location, "")
        self.assertEqual(StatusHistory.objects.count(), 3)

    def test_search_matches_number_or_destination_and_preserves_rows(self):
        self.create()
        self.payload.update(trackingNumber=OTHER, destination="Miami, Florida")
        self.create()
        for query, expected in [("111111", [NUMBER]), ("miami", [OTHER]), ("not-found", [])]:
            with self.subTest(query=query):
                response = self.client.get(BASE, {"search": query})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(
                    [guide["trackingNumber"] for guide in response.data["results"]], expected
                )
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (2, 2))

    def test_search_retains_cursor_limits_order_and_archive_filter(self):
        guides = Guide.objects.bulk_create(
            [
                Guide(
                    tracking_number=f"21{index + 2000:014d}",
                    origin="A",
                    destination="Miami",
                    recipient="C",
                )
                for index in range(105)
            ]
        )
        Guide.objects.filter(pk=guides[-1].pk).update(is_archived=True)
        expected = list(
            Guide.objects.filter(is_archived=False)
            .order_by("-created_at")
            .values_list("tracking_number", flat=True)
        )
        with self.assertNumQueries(2):
            response = self.client.get(BASE, {"search": "Miami"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["trackingNumber"] for item in response.data["results"]], expected[:20]
        )
        self.assertIn("search=Miami", response.data["next"])
        second = self.client.get(response.data["next"])
        self.assertEqual(second.status_code, 200)
        self.assertEqual(
            [item["trackingNumber"] for item in second.data["results"]], expected[20:40]
        )
        capped = self.client.get(BASE, {"search": "Miami", "page_size": 1000})
        self.assertEqual(len(capped.data["results"]), 100)
        self.assertEqual(Guide.objects.count(), 105)
        self.assertEqual(StatusHistory.objects.count(), 0)

    def test_empty_search_keeps_existing_list_behavior(self):
        self.create()
        response = self.client.get(BASE)
        for search in ["", "   "]:
            searched = self.client.get(BASE, {"search": search})
            self.assertEqual(searched.status_code, 200)
            self.assertEqual(searched.data, response.data)
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (1, 1))
