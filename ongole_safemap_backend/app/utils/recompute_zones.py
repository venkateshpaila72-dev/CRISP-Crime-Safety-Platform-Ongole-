import asyncio

from app.services.zone_service import zone_service


async def recompute_all_zones():

    zones = await zone_service.get_all_zones()

    return {

        "zones_updated": len(zones),

        "zones_created": 0,

        "total_zones": len(zones),

    }


if __name__ == "__main__":

    print(

        asyncio.run(

            recompute_all_zones()

        )

    )