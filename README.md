MongoDB ReplSet Configurator
============================

MongoDB의 Replica Set을 MongoDB Shell에 접속하지 않고 설정할 수 있는 프로그램이다.

다음과 같은 환경 변수를 사용한다.

- MRSC_ID (필수): Replica Set의 ID
- MRSC_SERVERS (필수): Replica Set의 서버 주소, 각 서버 주소를 `,`로 연결해서 입력
- MRSC_RECONFIG: 설정을 수정하려면 `true`, 기본값은 `false`

로컬에서는 다음과 같이 실행한다.

```
$ node index.js
```

Docker 환경이라면 다음과 같이 이미지를 빌드할 수 있다.

```
$ docker build -t kjunine/mongodb-replset-configurator .
```

Docker 컨테이너를 실행하려면 다음과 같이 실행하면 된다.

```
$ docker run -it --rm -e MRSC_ID=v4d -e MRSC_SERVERS=192.168.8.10:27017,192.168.8.11:27017 kjunine/mongodb-replset-configurator
```
