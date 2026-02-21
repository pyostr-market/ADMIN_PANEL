get
/users/admin/users?page=1&limit=20
{
"success": true,
"data": {
"items": [
{
"id": 2,
"public_id": "1fd482ec-52c2-4eb3-8269-5473d733d8d8",
"is_active": true,
"is_verified": true,
"created_at": "2026-02-18T14:12:45.444323+00:00",
"updated_at": "2026-02-20T22:33:02.596891+00:00",
"last_login_at": null,
"group": null,
"primary_phone": {
"id": 2,
"phone_number": "9995309522",
"is_verified": true
}
}
],
"pagination": {
"page": 1,
"limit": 20,
"total": 1,
"pages": 1
}
}
}
GET
users/admin/users/{id}
{
"success": true,
"data": {
"id": 2,
"public_id": "1fd482ec-52c2-4eb3-8269-5473d733d8d8",
"is_active": true,
"is_verified": true,
"created_at": "2026-02-18T14:12:45.444323+00:00",
"updated_at": "2026-02-20T22:33:02.596891+00:00",
"last_login_at": null,
"group": null,
"phones": [
{
"id": 2,
"phone_number": "9995309522",
"is_primary": true,
"is_verified": true,
"created_at": "2026-02-18T14:12:45.444323+00:00"
}
],
"social_accounts": [],
"sessions": [
{
"id": 2,
"refresh_token_id": 39,
"device_info": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
"ip_address": "127.0.0.1",
"created_at": "2026-02-18T17:08:41.458881+00:00",
"last_activity": null,
"is_active": true
},
{
"id": 3,
"refresh_token_id": 40,
"device_info": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
"ip_address": "127.0.0.1",
"created_at": "2026-02-18T17:53:34.053718+00:00",
"last_activity": null,
"is_active": true
},}
],
"permissions": [
{
"id": 1,
"name": "permission:view",
"description": "Просмотр прав"
},
{
"id": 4,
"name": "permission:update",
"description": "Обновление прав"
},]
}
}

DELETE
users/admin/users/{id}

UPDATE
users/admin/users/{id}

{
'field1': value
}

