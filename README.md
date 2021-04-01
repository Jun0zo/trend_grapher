# trend_grapher

키워드를 입력하면 해당 검색어의 근 1년간 검색횟수(모바일, PC 모두 제공)를 그래프 형태로 나타냅니다.

검색횟수는 네이버 API를 

localhost에서 구동하려면 아래가 필요합니다.

```
node.js
```

### Install & Run server

아래의 명령어를 실행해 주세요 (localhost:3333/keyword 에서 접속하실 수 있습니다)

```
$ cd trend_graph
$ npm install
$ node ./server.js
```

localhost:3333/keyword?kw={검색어} 를 입력하면 해당 검색어의 검색횟수가 그래프로 표시됩니다,

## Demo

<img width="577" alt="스크린샷 2021-04-02 오전 12 17 59" src="https://user-images.githubusercontent.com/37208901/113316319-28b86180-9349-11eb-8172-4ae815aaaabb.png">

### Main Page
