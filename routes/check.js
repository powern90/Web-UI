var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    const body = req.body; // body-parser 사용
    if( findUser(body.user_id, body.user_pwd)) {
        // 해당유저가 존재한다면
        req.session.user_uid = findUserIndex(body.user_id, body.user_pwd); //유니크한 값 유저 색인 값 저장
        res.redirect('/board');
    } else {
        res.send('유효하지 않습니다.');
    }
});

const users = [
    {
        user_id: '1',
        user_nickname: '혁',
        user_pwd: '1'
    },
    {
        user_id: 'hyc7575',
        user_nickname: '에이치',
        user_pwd: '1q2w3e4r'
    }
]

const findUser = (user_id, user_pwd) => {
    // id와 password가 일치하는 유저 찾는 함수, 없으면 undefined 반환
    return users.find( v => (v.user_id === user_id && v.user_pwd === user_pwd) );
}
const findUserIndex = (user_id, user_pwd) => {
    // 일치하는 유저의 index값(유니크) 반환
    return users.findIndex( v => (v.user_id === user_id && v.user_pwd === user_pwd) );
}

module.exports = router;