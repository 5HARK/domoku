/* ********** 상수 선언 ********** */
const STONE_NONE = 0;         // 아무돌도 없는 상태
const STONE_BLACK = 1;        // 흑돌 상태
const STONE_WHITE = 2;        // 백돌 상태
const BOARD_SIZE = 20;        // 게임 사이즈
const CANVAS_SIZE = 640;      // 캔버스 사이즈
const CANVAS_ID = "mycanvas"; // 캔버스 DOM ID
const CANVAS_MARGIN = 20;     // 캔버스 내 판 여백 값(px)
const CANVAS_GAME_SIZE = CANVAS_SIZE - CANVAS_MARGIN*2; // 실제 판 크기(여백 뺀 값)
var board;                        // 판 상태 2차원 배열
var board_stack = new Array();    // 판 착수 순서 스택
var stone_black_color = "black";  // 흑돌 출력용 CSS 색깔 문자열
var stone_white_color = "white";  // 백돌 출력용 CSS 색깔 문자열
var gamestart = false;            // 게임 시작 여부
var blackturn = true;             // 게임 턴 차례
var whitefirst = false;           // 백돌 선수 여부
var gamestart_time = '';          // 게임 시작 시간 저장용
var gameend_time = '';            // 게임 종료 시간 저장용



/* ********** 기타 유틸리티 함수 ********** */
// 현재 시간 알아오는 함수
function getTimeStamp() {
    var d = new Date();
    var s =
	leadingZeros(d.getFullYear(), 4) + '-' +
	leadingZeros(d.getMonth() + 1, 2) + '-' +
	leadingZeros(d.getDate(), 2) + ' ' +
	leadingZeros(d.getHours(), 2) + ':' +
	leadingZeros(d.getMinutes(), 2) + ':' +
	leadingZeros(d.getSeconds(), 2);
    return s;
}
// 현재 시간 알아오는 함수 문자열 보조 처리
function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();
    if (n.length < digits) {
	for (i = 0; i < digits - n.length; i++)
	    zero += '0';
    }
    return zero + n;
}
/* ********** 게임 초기화 관련 ********** */
// 판 초기화
function init_board(){
    // 게임판 2차원 배열 및 스택 선언
    board = new Array();
    board_stack = new Array();
    // board 2차원 배열 초기화
    for(var i=0; i<BOARD_SIZE; i++){
	board[i] = new Array();
	for(var j=0; j<BOARD_SIZE; j++){
	    board[i][j] = STONE_NONE;
	}
    }
}
// 게임 상태 초기화
function init_game(){
    blackturn = true;
}



/* ********** 게임 상태 질의 관련 ********** */
// 디버그 모드 질의
function is_debugmode(){
    return false;
}
// 게임 시작 여부 질의
function is_gamestart(){
    return gamestart;
}
// 선수 색깔 질의
function is_whitefirst(){
    return whitefirst;
}
// 게임 턴 차례 질의
function is_blackturn(){
    return blackturn;
}



/* ********** 게임 상태 관련 ********** */
// 선수 바꾸기 루틴
function change_first(){
    whitefirst = !whitefirst;
    if(whitefirst){
	stone_white_color = "black";
	stone_black_color = "white";
    }else{
	stone_white_color = "white";
	stone_black_color = "black";
    }
}
// 게임 승리 루틴
function win_game(_stone){  // 게임 승리 관련 처리 루틴
    gameend_time = getTimeStamp();
    print_winmsg(_stone);
    end_game();
}



/* ********** 이벤트 핸들러, 인터페이스 ********** */
// 게임 시작 처리 루틴
function start_game(){
    document.getElementById("start_button").disabled = true;
    document.getElementById("retire_button").disabled = false;
    document.getElementById("blackfirst").disabled = true;
    document.getElementById("whitefirst").disabled = true;
    init_board();
    init_game();
    stroke_board();
    gamestart = true;
    gamestart_time = getTimeStamp();
}
// 게임 기권 처리 루틴
function retire_game(){
    if(is_blackturn())
	win_game(STONE_WHITE);
    else
	win_game(STONE_BLACK);
}
// 게임 종료 처리 루틴
function end_game(){
    gamestart = false;
    gamestart_time = '';
    gameend_time = '';
    document.getElementById("start_button").disabled = false;
    document.getElementById("back_button").disabled = true;
    document.getElementById("retire_button").disabled = true;
    document.getElementById("blackfirst").disabled = false;
    document.getElementById("whitefirst").disabled = false;
};
// 착수 루틴
function put_stone(e){
    if(!is_gamestart()) // 게임이 진행중이지 않을경우
	return;
    var x = 0;
    var y = 0;
    // 좌표계에서의 판 한칸 크기 저장용 변수
    var sz = (CANVAS_GAME_SIZE / (BOARD_SIZE-1));
    // 가장 가까운 교점에서 떨어진 좌표 오프셋 구하기
    var a = (e.offsetX - CANVAS_MARGIN) % sz;
    var b = (e.offsetY - CANVAS_MARGIN) % sz;
    // 가장 가까운 교점 좌표로 조정 시켜주는 로직
    if(a <= sz/2){
	x = e.offsetX - a - 1;
    }else{
	x = e.offsetX + (sz-a) - 1;
    }
    if(b <= sz/2){
	y = e.offsetY - b - 1;
    }else{
	y = e.offsetY + (sz-b) - 1;
    }
    // 소수점 반올림 처리
    x = Math.round(x / sz);
    y = Math.round(y / sz);
    // 판 넘어가기 방지용 루틴
    if(x > BOARD_SIZE)
	x = BOARD_SIZE;
    if(y > BOARD_SIZE)
	y = BOARD_SIZE;
    // 좌표계와 배열인덱스 차이 빼주기
    if(x-1 >= 0)
	x = x-1;
    if(y-1 >= 0)
	y = y-1;
    // 디버그 모드 비활성화 이면서 놓은 자리에 돌이 없을 경우
    if(!is_debugmode() && board[y][x] == STONE_NONE){
	var tmp_color = -1;
	// 현재 턴 차례에 맞게 흑백 구분
	if(blackturn)
	    tmp_color = STONE_BLACK;
	else
	    tmp_color = STONE_WHITE;
	// 금수 판정 위해 일단 판에 착수 시행
	board[y][x] = tmp_color;
	// 돌이 한개라도 판에 놓여진 순간 무르기 버튼 활성화
	if(board_stack.length != 0)
	    document.getElementById("back_button").disabled = false;
	var result = check_pointer(x, y, tmp_color, board);
	// 정상적인 착수 판정 받았을 경우
	if(result == null){
	    blackturn = !blackturn;
	    board_stack.push([x, y, tmp_color]); // 기보 스택에 푸시
	}
	// 금수 판정 받았을 경우
	else if(result == false){
	    board[y][x] = STONE_NONE;
	    alert('금수 입니다. 놓을 수 없습니다.');
	}
	// 승리 판정 받았을 경우
	else if(result == true){
	    board_stack.push([x, y, tmp_color]); // 기보 스택에 푸시
	    if(is_blackturn())
		win_game(STONE_BLACK);
	    else
		win_game(STONE_WHITE);
	}
	// 보드판 재 표시
	print_board(board);
    }
}
// 무르기 루틴
function delete_stone(e){
    if(confirm('한수 물러주시겠습니까?')){
	// 기보 스택에서 수 제거
	node = board_stack.pop();
	// 판 배열에서 수 제거
	board[node[1]][node[0]] = STONE_NONE;
	blackturn = !blackturn;
	print_board(board);
    }
}
// 브라우저 종료 루틴
function exit_game(e){
    window.close();
}



/* ********** 게임 표시 관련 ********** */
// 판 그리기 루틴
function stroke_board(){
    var mycanvas = document.getElementById(CANVAS_ID);
    var context = mycanvas.getContext("2d");
    // 판 배경색 그리기
    context.fillStyle = "#d9c049";
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // 칸 경계선들 그리기
    context.strokeStyle = "#333333";
    for(var x=CANVAS_MARGIN; x<=CANVAS_SIZE - CANVAS_MARGIN*2; x+=(CANVAS_GAME_SIZE/(BOARD_SIZE - 1))) {
	for(var y=CANVAS_MARGIN; y<=CANVAS_SIZE - CANVAS_MARGIN*2; y+=(CANVAS_GAME_SIZE/(BOARD_SIZE - 1))) {
	    context.strokeRect(x, y, ((CANVAS_SIZE - CANVAS_MARGIN)/(BOARD_SIZE - 1)), ((CANVAS_SIZE - CANVAS_MARGIN)/(BOARD_SIZE - 1)));
	}
    }
    context.beginPath();
    context.closePath();
    context.fillStyle = "#000000";
    context.fill();
}
// 돌 그리기 루틴
function fillStone2(_x,_y,_stone){
    var mycanvas = document.getElementById(CANVAS_ID);
    var context = mycanvas.getContext("2d");
    context.beginPath();
    var stone_size = (CANVAS_GAME_SIZE/(BOARD_SIZE - 1));
    // 돌 그릴 좌표에 판 여백 좌표 만큼 더하는 처리들
    var x=_x*stone_size+CANVAS_MARGIN;
    var y=_y*stone_size+CANVAS_MARGIN;
    context.arc(x, y, stone_size/2, 0, Math.PI*2);
    context.closePath();
    // 선수 변경시 사용자에게 보이는 색깔만 변경
    if(_stone==STONE_BLACK)
	context.fillStyle = stone_black_color;
    else if(_stone==STONE_WHITE)
	context.fillStyle = stone_white_color;
    context.fill();
};
// 판 출력 인터페이스
function print_board(_board){
    stroke_board(); 	 // 칸 경계선 그리기
    var mycanvas = document.getElementById("mycanvas");
    var context = mycanvas.getContext("2d");
    context.beginPath();
    context.closePath();
    context.fillStyle = "#000000";
    context.fill();
    // 현재 판 상태 배열을 참조하여 판에 돌들 그려주는 루틴
    for(var _x=0;_x<BOARD_SIZE;_x++)
	for(var _y=0;_y<BOARD_SIZE;_y++)
    {
	if(_board[_x][_y]==STONE_BLACK)
	    fillStone2(_y,_x, STONE_BLACK);
	else if(_board[_x][_y]==STONE_WHITE)
	    fillStone2(_y,_x, STONE_WHITE);
    }
};
// 승리 메시지 출력 인터페이스
function print_winmsg(_stone){
    if(_stone == STONE_BLACK){
	if(is_whitefirst()){  // 백이 선수 일 경우(흑백 색깔 바뀌었을 경우)
	    print_gamelog('(' + gamestart_time + ' ~ ' + gameend_time + ') 백 ' + board_stack.length + ' 수만에 승리');
	}else{ // 흑이 선수 일 경우(흑백 색깔 그대로)
	    print_gamelog('(' + gamestart_time + ' ~ ' + gameend_time + ') 흑 ' + board_stack.length + ' 수만에 승리');
	}
    }else if(_stone == STONE_WHITE){
	if(is_whitefirst()){  // 백이 선수 일 경우(흑백 색깔 바뀌었을 경우)
	    print_gamelog('(' + gamestart_time + ' ~ ' + gameend_time + ') 흑 ' + board_stack.length + ' 수만에 승리');
	}else{ // 흑이 선수 일 경우(흑백 색깔 그대로)
	    print_gamelog('(' + gamestart_time + ' ~ ' + gameend_time + ') 백 ' + board_stack.length + ' 수만에 승리');
	}
    }
}
// 게임 로그 출력 함수
function print_gamelog(message){
    document.querySelector("textarea[name=gamelog]").value += message + '\r\n';
};



/* ********** 게임 로직 관련 ********** */
// 착수,금수 처리 루틴
function check_pointer(_x, _y, _stone, _board){
    var x, y;
    // 돌 카운트 변수들
    var count;       // 단순 카운팅
    var count_black; // 흑돌 카운팅
    var count_none;  // 빈칸 카운팅
    var count_white; // 백돌 카운팅
    // 3x3, 4x4 판단용 boolean 변수들
    var hori_33 = false;  // 가로 33
    var vert_33 = false;  // 세로 33
    var ltrb_33 = false;  // 대각선↘ 33
    var rtlb_33 = false;  // 대각선↙ 33
    var hori_44 = false;  // 가로 44
    var vert_44 = false;  // 세로 44
    var ltrb_44 = false;  // 대각선↘ 44
    var rtlb_44 = false;  // 대각선↙ 44
    if(_stone == STONE_BLACK){ // 금수는 흑에게만 적용
	/*      3*3 판별 로직      */
	// 가로 방향 카운팅
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	// 가로 우 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(x+i > BOARD_SIZE-1)
		break;
	    if(_board[_y][x+i] != STONE_WHITE){
		if(_board[_y][x+i] == STONE_BLACK){
		    count_black++;
		}else if(_board[_y][x+i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[_y][x+i] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && x+i+1 < BOARD_SIZE)
		if(_board[_y][x+i+1] == STONE_WHITE)
		    count_white++;
	}
	// 가로 우 방향 열린 3 여부 체킹
	var tmp_hori_33 = true;
	if(count_none <= count_white)
	    tmp_hori_33 = false;
	// 가로 좌 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(x-i < 0)
		break;
	    if(_board[_y][x-i] != STONE_WHITE){
		if(_board[_y][x-i] == STONE_BLACK){
		    count_black++;
		}else if(_board[_y][x-i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[_y][x-i] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && x-i-1 > 0)
		if(_board[_y][x-i-1] == STONE_WHITE)
		    count_white++;
	}
	// 둘다 열린 3이면서 흑돌이 3개인 경우
	if(count_none-count_white > 3 && tmp_hori_33 && count_black == 3)
	    hori_33 = true;  // 가로 방향 3x3 판정
	// 세로 방향 카운팅
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	// 세로 하 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(y+i > BOARD_SIZE-1)
		break;
	    if(_board[y+i][_x] != STONE_WHITE){
		if(_board[y+i][_x] == STONE_BLACK){
		    count_black++;
		}else if(_board[y+i][_x] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y+i][_x] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && y+i+1 < BOARD_SIZE)
		if(_board[y+i+1][_x] == STONE_WHITE)
		    count_white++;
	}
	// 세로 하 방향 열린 3 여부 체킹
	var tmp_vert_33 = true;
	if(count_none <= count_white)
	    tmp_vert_33 = false;
	// 세로 상 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(y-i < 0)
		break;
	    if(_board[y-i][_x] != STONE_WHITE){
		if(_board[y-i][_x] == STONE_BLACK){
		    count_black++;
		}else if(_board[y-i][_x] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y-i][_x] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && y-i-1 < 0)
		if(_board[y-i-1][_x] == STONE_WHITE)
		    count_white++;
	}
	// 둘다 열린 3면서 흑돌이 3개인 경우
	if(count_none-count_white > 3 && tmp_vert_33 && count_black == 3)
	    vert_33 = true;  // 세로 방향 33 판정
	// 대각선↘
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	// 대각선 우 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(y+i > BOARD_SIZE-1 || x+i > BOARD_SIZE-1)
		break;
	    if(_board[y+i][x+i] != STONE_WHITE){
		if(_board[y+i][x+i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y+i][x+i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y+i][x+i] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && y+i+1 < BOARD_SIZE && x+i+1 < BOARD_SIZE)
		if(_board[y+i+1][x+i+1] == STONE_WHITE)
		    count_white++;
	}
	// 대각선 우 방향 열린 3 여부 체킹
	var tmp_ltrb_33 = true;
	if(count_none <= count_white)
	    tmp_ltrb_33 = false;
	// 대각선 좌 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(y-i < 0 || x-i < 0)
		break;
	    if(_board[y-i][x-i] != STONE_WHITE){
		if(_board[y-i][x-i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y-i][x-i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y-i][x-i] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && y-i-1 > 0 && x-i-1 > 0)
		if(_board[y-i-1][x-i-1] == STONE_WHITE)
		    count_white++;
	}
	// 둘다 열린 3 이면서 흑돌이 3개인 경우
	if(count_none-count_white > 3 && tmp_ltrb_33 && count_black == 3)
	    ltrb_33 = true;  // 대각선↘ 방향 33 판정
	// 대각선↙
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	// 대각선 좌 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(y+i > BOARD_SIZE-1 || x-i < 0)
		break;
	    if(_board[y+i][x-i] != STONE_WHITE){
		if(_board[y+i][x-i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y+i][x-i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y+i][x-i] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && y+i+1 < BOARD_SIZE && x-i-1 > 0)
		if(_board[y+i+1][x-i-1] == STONE_WHITE)
		    count_white++;
	}
	// 대각선 좌 방향 열린 3 여부 체킹
	var tmp_rtlb_33 = true;
	if(count_none <= count_white)
	    tmp_rtlb_33 = false;
	// 대각선 우 방향
	for(var i=1; i<4; i++){
	    // 게임판 탈출 방지 루틴
	    if(y-i < 0 || x+i > BOARD_SIZE-1)
		break;
	    if(_board[y-i][x+i] != STONE_WHITE){
		if(_board[y-i][x+i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y-i][x+i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y-i][x+i] == STONE_WHITE){
		count_white++;
		break;
	    }
	    // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
	    if(i==3 && y-i-1 > 0 && x+i+1 < BOARD_SIZE)
		if(_board[y-i-1][x+i+1] == STONE_WHITE)
		    count_white++;
	}
	// 둘다 열린 3 이면서 흑돌이 3개인 경우
	if(count_none-count_white > 3 && tmp_rtlb_33 && count_black == 3)
	    rtlb_33 = true;  // 대각선↙ 방향 33 판정
	/*      4*4 판별 로직      */
	// 가로
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	for(var i=1; i<5; i++){
	    if(x+i > BOARD_SIZE-1)
		break;
	    if(_board[_y][x+i] != STONE_WHITE){
		if(_board[_y][x+i] == STONE_BLACK){
		    count_black++;
		}else if(_board[_y][x+i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[_y][x+i] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
	for(var i=1; i<5; i++){
	    if(x-i < 0)
		break;
	    if(_board[_y][x-i] != STONE_WHITE){
		if(_board[_y][x-i] == STONE_BLACK){
		    count_black++;
		}else if(_board[_y][x-i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[_y][x-i] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
	// 둘다 열린 4 이면서 흑돌이 4개인 경우
	if(count_none >= count_white && count_black == 4)
	    hori_44 = true;  // 가로 방향 44 판정
	// 세로
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	for(var i=1; i<5; i++){
	    if(y+i > BOARD_SIZE-1)
		break;
	    if(_board[y+i][_x] != STONE_WHITE){
		if(_board[y+i][_x] == STONE_BLACK){
		    count_black++;
		}else if(_board[y+i][_x] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y+i][_x] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
	for(var i=1; i<5; i++){
	    if(y-i < 0)
		break;
	    if(_board[y-i][_x] != STONE_WHITE){
		if(_board[y-i][_x] == STONE_BLACK){
		    count_black++;
		}else if(_board[y-i][_x] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y-i][_x] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
 	// 둘다 열린 4 이면서 흑돌이 4개인 경우
	if(count_none >= count_white && count_black == 4)
	    vert_44 = true; // 세로 방향 44 판정
	// 대각선↘
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	for(var i=1; i<5; i++){
	    if(y+i > BOARD_SIZE-1 || x+i > BOARD_SIZE-1)
		break;
	    if(_board[y+i][x+i] != STONE_WHITE){
		if(_board[y+i][x+i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y+i][x+i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y+i][x+i] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
	for(var i=1; i<5; i++){
	    if(y-i < 0 || x-i < 0)
		break;
	    if(_board[y-i][x-i] != STONE_WHITE){
		if(_board[y-i][x-i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y-i][x-i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y-i][x-i] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
	// 둘다 열린 4 이면서 흑돌이 4개인 경우
	if(count_none >= count_white && count_black == 4)
	    ltrb_44 = true;  // 대각선↘ 방향 44 판정
	// 대각선↙ new
	x = _x;
	y = _y;
	count_black = 1;
	count_none = 0;
	count_white = 0;
	for(var i=1; i<5; i++){
	    if(y+i > BOARD_SIZE-1 || x-i < 0)
		break;
	    if(_board[y+i][x-i] != STONE_WHITE){
		if(_board[y+i][x-i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y+i][x-i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y+i][x-i] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
	for(var i=1; i<5; i++){
	    if(y-i < 0 || x+i > BOARD_SIZE-1)
		break;
	    if(_board[y-i][x+i] != STONE_WHITE){
		if(_board[y-i][x+i] == STONE_BLACK){
		    count_black++;
		}else if(_board[y-i][x+i] == STONE_NONE){
		    count_none++;
		}
	    }else if(_board[y-i][x+i] == STONE_WHITE){
		count_white++;
		break;
	    }
	}
	// 둘다 열린 4 이면서 흑돌이 4개인 경우
	if(count_none >= count_white && count_black == 4)
	    rtlb_44 = true;  // 대각선↙ 방향 44 판정
	// 3*3 판정 결과중 가로,세로,대각선 2개방향 중 2개이상이 해당될 경우(3*3 인 상황)
	if(hori_33 + vert_33 + ltrb_33 + rtlb_33 >= 2){ // 33 판정 결과 먼저 확인
	    return false;  // 금수 처리
	}
 	// 4*4 판정 결과중 가로,세로,대각선 2개방향 중 2개이상이 해당될 경우(4*4 인 상황)
	else if(hori_44 + vert_44 + ltrb_44 + rtlb_44 >= 2){
	    return false;  // 금수 처리
	}
	/*      4*4 예외 판별 로직      */
	/* 위의 4*4 판별 로직에서 걸러낼수 없는 동일 축 내에서 2개의 44가 발생하는 경우 */
	/* ●●빈●●빈●● 이거랑 ●빈●●●빈● 패턴 찾아내기 */
	// 패턴 문자열 변수들
	var hori_44 = '';
	var vert_44 = '';
	var ltrb_44 = '';
	var rtlb_44 = '';
	// 가로
	// 모든 가로축에 돌들에 대해 수집
	for(var i=0; i<BOARD_SIZE; i++){
	    hori_44 = hori_44.concat(_board[_y][i]);
	}
	// 세로
	// 모든 세로축에 돌들에 대해 수집
	for(var i=0; i<BOARD_SIZE; i++){
	    vert_44 = vert_44.concat(_board[i][_x]);
	}
	// 대각선 ↘
	// 모든 대각선 ↘에 돌들에 대해 수집
	x = _x;
	y = _y;
	// 대각선 끝점 찾기
	while(y > 0 && x > 0){
	    y--;
	    x--;
	}
	do{
	    ltrb_44 = ltrb_44.concat(_board[y][x]);
	}while(++y < BOARD_SIZE && ++x < BOARD_SIZE)
	// 대각선 ↙
	// 모든 대각선 ↙의 돌들에 대해 수집
	x = _x;
	y = _y;
	// 대각선 끝점 찾기
	while(y > 0 && x < BOARD_SIZE){
	    y--;
	    x++;
	}
	do{
	    rtlb_44 = rtlb_44.concat(_board[y][x]);
	}while(++y < BOARD_SIZE && --x > 0)
	// 찾아낼 착수 패턴 문자열 변수들
	pt1 = (''+STONE_BLACK)
	    + (''+STONE_BLACK)
	    + (''+STONE_NONE)
	    + (''+STONE_BLACK)
	    + (''+STONE_BLACK)
	    + (''+STONE_NONE)
	    + (''+STONE_BLACK)
	    + (''+STONE_BLACK);
	pt2 = (''+STONE_BLACK)
	    + (''+STONE_NONE)
	    + (''+STONE_BLACK)
	    + (''+STONE_BLACK)
	    + (''+STONE_BLACK)
	    + (''+STONE_NONE)
	    + (''+STONE_BLACK);
	// 가로,세로,대각선2방향의 돌 정보중 패턴이 하나라도 포함될 경우, 44 예외 판정
	if(hori_44.includes(pt1) || hori_44.includes(pt2)) // 가로
	    return false;  // 금수 처리
	else if(vert_44.includes(pt1) || vert_44.includes(pt2)) // 세로
	    return false;
	else if(ltrb_44.includes(pt1) || ltrb_44.includes(pt2)) // 대각선↘
	    return false;
	else if(rtlb_44.includes(pt1) || rtlb_44.includes(pt2)) // 대각선↙
	    return false;
	/* 5,6목 이상 판별 로직 */
	// 가로
	x = _x;
	y = _y;
	count = 0;
	// 카운팅 시작점 찾기
	while(x-- > 0 && _board[_y][x] == STONE_BLACK);
	// 카운팅
	while(++x < BOARD_SIZE && _board[_y][x] == STONE_BLACK)
	    count++;
	// 6목 이상일 경우
	if(count > 5)
	    return false;  // 금수 처리
	// 정확히 5목 일 경우
	else if(count == 5)
	    return true;  // 승리 처리
	// 세로
	x = _x;
	y = _y;
	count = 0;
	// 카운팅 시작점 찾기
	while(y-- > 0 && _board[y][_x] == STONE_BLACK);
	// 카운팅
	while(++y < BOARD_SIZE && _board[y][_x] == STONE_BLACK)
	    count++;
	if(count > 5)
	    return false;
	else if(count == 5)
	    return true;
	// 대각선 ↘
	x = _x;
	y = _y;
	count = 0;
	// 카운팅 시작점 찾기
	while(x-- > 0 && y-- > 0 && _board[y][x] == STONE_BLACK);
	// 카운팅
	while(++x < BOARD_SIZE && ++y < BOARD_SIZE && _board[y][x] == STONE_BLACK)
	    count++;
	if(count > 5)
	    return false;
	else if(count == 5)
	    return true;
	// 대각선 ↙
	x = _x;
	y = _y;
	count = 0;
	// 카운팅 시작점 찾기
	while(x++ < BOARD_SIZE && y-- > 0 && _board[y][x] == STONE_BLACK);
	// 카운팅
	while(--x > 0 && ++y < BOARD_SIZE && _board[y][x] == STONE_BLACK)
	    count++;
	if(count > 5)
	    return false;
	else if(count == 5)
	    return true;
    }else if(_stone == STONE_WHITE){
	/*      백 승리 판별 로직      */
	/* 백(후수)은 모든 금수 처리에 대해 예외이기 때문에 승리 조건만 검사 */
	// 백 승리 검사용 문자열 변수들
	var hori_win = '';
	var vert_win = '';
	var ltrb_win = '';
	var rtlb_win = '';
	// 가로
	// 가로 방향에 대해 모든 돌 정보 수집
	for(var i=0; i<BOARD_SIZE; i++){
	    hori_win = hori_win.concat(_board[_y][i]);
	}
	// 세로
	for(var i=0; i<BOARD_SIZE; i++){
	    vert_win = vert_win.concat(_board[i][_x]);
	}
	// 대각선 ↘
	x = _x;
	y = _y;
	// 대각선 끝점 선정
	while(y > 0 && x > 0){
	    y--;
	    x--;
	}
	do{
	    ltrb_win = ltrb_win.concat(_board[y][x]);
	}while(++y < BOARD_SIZE && ++x < BOARD_SIZE)
	// 대각선 ↙
	x = _x;
	y = _y;
	// 대각선 끝점 선정
	while(y > 0 && x < BOARD_SIZE){
	    y--;
	    x++;
	}
	do{
	    rtlb_win = rtlb_win.concat(_board[y][x]);
	}while(++y < BOARD_SIZE && --x > 0)
	// 찾아낼 착수 패턴
	pt = (''+STONE_WHITE)
	    + (''+STONE_WHITE)
	    + (''+STONE_WHITE)
	    + (''+STONE_WHITE)
	    + (''+STONE_WHITE);
	// 가로,세로,대각선2 방향 중 패턴과 하나라도 일치할 경우, 백 승리 판정
	if(hori_win.includes(pt))
	    return true;
	else if(vert_win.includes(pt))
	    return true;
	else if(ltrb_win.includes(pt))
	    return true;
	else if(rtlb_win.includes(pt))
	    return true;
    }
    // 모든 금수 로직에 걸리지 않았을 경우
    return null;  // 정상 착수 처리
}
