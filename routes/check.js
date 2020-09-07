var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    const body = req.body; // body-parser 사용
    if( findUser(body.login)) {
        // 해당유저가 존재한다면
        req.session.user_uid = findUserIndex(body.login); //유니크한 값 유저 색인 값 저장
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
        user_id: '2',
        user_nickname: '에이치',
        user_pwd: '2'
    }
]

const findUser = (info) => {
    // id와 password가 일치하는 유저 찾는 함수, 없으면 undefined 반환
    return users.find( v => (v.user_id === info[0] && v.user_pwd === info[1]) );
}
const findUserIndex = (info) => {
    // 일치하는 유저의 index값(유니크) 반환
    return users.findIndex( v => (v.user_id === info[0] && v.user_pwd === info[1]) );
}

module.exports = router;