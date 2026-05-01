import json
from urllib import request, error

url = 'http://127.0.0.1:8000/api/auth/register/'
data = json.dumps({
    'email': 'test@example.com',
    'username': 'testuser',
    'password': 'password123',
    'role': 'MEMBER',
}).encode('utf-8')
req = request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    resp = request.urlopen(req)
    print(resp.read().decode())
except error.HTTPError as e:
    print('STATUS', e.code)
    print(e.read().decode())
