export const user = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "/user",
  "title": "User",
  "description": "A user/staff in the blog",
  "type": "object",
  "properties": {
    "username": {
      "description": "username of blog account",
      "type": "string"
    },
    "email": {
      "description": "email of user",
      "type": "string"
    },
    "password": {
      "description": "password of user (optional for OAuth users)",
      "type": "string"
    },
    "avatarurl": {
      "description": "avatar of user",
      "type": "uri"
    },
    "role": {
      "description": "role of user",
      "type": "string"
    },
    "googleId": {
      "description": "Google OAuth ID (optional)",
      "type": "string"
    },
    "authProvider": {
      "description": "Authentication provider (basic, google, etc.)",
      "type": "string"
    }
  },
  "required": ["username", "email"]
}

