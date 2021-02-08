var express = require('express');
const route = express.Router()

test('checks cookie is set to logout value', () => {
  route.post("/logout", (req, res, next) => {
    let cookie = res.cookie('authcookie','',{ maxAge:1 });
    expect(cookie).toBe(res.cookie('authcookie','',{ maxAge:1 }))
  })
});