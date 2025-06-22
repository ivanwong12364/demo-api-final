// 請確保您修改的是這個檔案：../schema/hotel.schema.ts
// 而不是 ../schema/hotel.schema.js

export const hotel = {
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
        "location": {
            "description": "City or geographical location of the hotel", // 建議修正描述
            "type": "string" // <--- 確保這裡已改為 "string"
        },
        "price": {
            "description": "Price of the hotel", // 建議修正描述
            "type": "number", // <--- 確保這裡已改為 "number"
            "minimum": 0
        },
        "description": {
            "description": "Description of hotel in more details",
            "type": "string"
        }
    },
    "required": ["title", "alltext", "agencyid"]
};
