     export const hotel= {
         "$schema": "http://json-schema.org/draft-04/schema#",
         "id": "/hotel",
         "title": "Hotel",
         "description": "A hotel in the system",
         "type": "object",
         "properties": {
             "title": {
                 "description": "Main title of the hotel",
                 "type": "string"
             },
             "alltext": {
                 "description": "Body text of the hotel",
                 "type": "string"
             },
             "summary": {
                 "description": "Optional short text summary of hotel",
                 "type": "string"
             },
             "imageURL": {
                 "description": "URL for main image to show in hotel",
                 "type": "string"
             },
             "published": {
                 "description": "Is the hotel published or not",
                 "type": "boolean"
             },
             "agencyid": {
                 "description": "User ID of the hotel agency",
                 "type": "integer",
                 "minimum": 0
             },
             "description": {
                 "description": "Description of hotel in more details",
                 "type": "string"
             }
         },
         "required": ["title", "alltext", "agencyid"]
     };