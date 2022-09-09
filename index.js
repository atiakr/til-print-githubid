const { existsSync, readFileSync, readdirSync } = require('fs');
const { get } = require('axios');
const homedir = require('os').homedir;
const path = require('path')


function printRegistedGithubID() {
  const curentHomedir = path.join(String(homedir), '.codestates-token')  
  const prevHomedir   = path.join(String(homedir), '../')  
  const userList      = readdirSync(String(prevHomedir));
  
  const arrID         = [];
  const arrUser       = [];
  const arrToken      = [];
  let checksum  = 0;

  if (userList.length >= 30) return console.log(' 홈디렉토리 상위폴더 내 폴더가 너무 많습니다... ');

  for (let i = 0; i < userList.length; i ++){
    //TODO: 상위디렉토리에서 폴더아닌것들은 배열에서 지우기
    const _dir = path.join(prevHomedir, userList[i], '.codestates-token');

    if (existsSync(_dir)) {
      checksum ++;
      const _token = readFileSync(_dir).toString().split('\n')[0];

      arrToken.push(_token);

      get('https://api.github.com/user', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${_token}`
        }
      })
      .then(resp => {
          if (curentHomedir === _dir){
            console.log(`\n★ 현재경로 과제제출용 github 아이디: ${resp.data.login} `);
            console.log(`★ 현재경로 과제제출용 github 식별자: ${resp.data.id} \n`);
          } else {
            console.log(`\n- 사용자계정 ${userList[i]} 과제제출용 github 아이디: ${resp.data.login} `);
            console.log(`- 사용자계정 ${userList[i]} 과제제출용 github 식별자: ${resp.data.id} \n`);
          }
          arrUser.push(userList[i]);
          arrID.push(resp.data.login);
      })
      .catch(handleError);
    }
  }

  // 토큰이 다르면 에러문 출력하기 
  for( let i = 1; i < arrToken.length; i ++ ) {
    if (arrToken[0] !== arrToken[i]) {
      console.log(`\n[error]: 사용자계정마다 과제제출시 사용하는 token 이 달라요.`);
    }
  }

  // 홈디렉토리 내에 codestates-token 이 없으면 출력
  if (checksum === 0) {
    console.log(`컴퓨터 내에 코드스테이츠 패키지 github 인증이 완료된 계정이 없어요.`);
  }
}

const handleError = err => {
    console.log("에러문 표시");
    console.log(err);
}

printRegistedGithubID();
