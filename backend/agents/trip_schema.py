# -*- coding: utf-8 -*-

# ------------------------------------------------------------------------------
#
#   Copyright 2018 Fetch.AI Limited
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
# ------------------------------------------------------------------------------


from oef.schema import DataModel, AttributeSchema, Location


class TRIP_DATAMODEL(DataModel):
    PERSON_ID = AttributeSchema("account_id",
                                str,
                                is_attribute_required=True,
                                attribute_description="Person ID.")

    CAN_BE_DRIVER = AttributeSchema("can_be_driver",
                                bool,
                                is_attribute_required=True,
                                attribute_description="Can person be driver?")

    TRIP_ID = AttributeSchema("trip_id",
                              str,
                              is_attribute_required=True,
                              attribute_description="Person ID.")

    FROM_LOCATION = AttributeSchema("from_location",
                                    Location,
                                    is_attribute_required=True,
                                    attribute_description="Longitude of FROM point.")

    TO_LOCATION = AttributeSchema("to_location",
                                  Location,
                                  is_attribute_required=True,
                                  attribute_description="Longitude of TO point.")

    DISTANCE_AREA = AttributeSchema("distance_area",
                                  int,
                                  is_attribute_required=False,
                                  attribute_description="Allowed distance of area from center of way-point.")

    def __init__(self):
        super().__init__("trip_datamodel", [self.PERSON_ID,
                                            self.CAN_BE_DRIVER,
                                            self.TRIP_ID,
                                            self.FROM_LOCATION,
                                            self.TO_LOCATION,
                                            self.DISTANCE_AREA],
                         "Trip create fully.")
