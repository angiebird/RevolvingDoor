'use strict';

// TODO: remove stateService before launching the game.
var app = angular.module('myApp', ['myApp.messageService', 'myApp.gameLogic', 'platformApp', 'myApp.hexagon', 'myApp.scaleBodyService']);
  app.controller('Ctrl', function (
      $window, $scope, $log,
      messageService, stateService, gameLogic, hexagon, scaleBodyService) {

      $scope.mouseDown= function ($event) {
          if(!$scope.isYourTurn){
              return;
          }
          try{
              if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] == -1){
                  //console.log($event.pageX + "-" + $event.pageY);
                  var trXY = scaleBodyService.reverse($event.pageX, $event.pageY);

                  var tileSide = hexagon.getSelectedTileSide(trXY.x, trXY.y);
                  console.log(tileSide);
                  if(gameLogic.isEdge(tileSide.row, tileSide.column, tileSide.side)){
                     var move = gameLogic.createMove($scope.board, $scope.token, tileSide.row, tileSide.column, 0, tileSide.side, $scope.turnIndex);
                     $scope.isYourTurn = false;
                     //console.log("isYorTurn:" + $scope.isYourTurn)
                     sendMakeMove(move);
                  }
              }
          } catch(e){
              $log.info(["Cell is already full in position:", row, col]);
              return;
          }
      };

    $scope.selTile = function () {
        console.log("selTile");
        if(!$scope.isYourTurn){
            console.log("not your turn");
            return;
        }
        try{
            if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] !== -1){
                $scope.tidIdx = ($scope.tidIdx+1)%2;
                $scope.rot = 0;
                var row = $scope.token[$scope.turnIndex][0];
                var column = $scope.token[$scope.turnIndex][1];
                var s = $scope.token[$scope.turnIndex][2];
                hexagon.drawPathTileAtColRow(column, row, $scope.tid[$scope.tidIdx], $scope.rot);
                hexagon.drawSelectedTileSide(column, row, s, color[$scope.turnIndex]);
            }
        } catch(e){
            $log.info(["Cell is already full in position:", row, col]);
            return;
        }
    };

    $scope.turnTile = function () {
        if(!$scope.isYourTurn){
            return;
        }
        try{
            if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] !== -1){
                $scope.rot = ($scope.rot + 1)%hexagon.sideNum;
                var row = $scope.token[$scope.turnIndex][0];
                var column = $scope.token[$scope.turnIndex][1];
                var s = $scope.token[$scope.turnIndex][2];
                hexagon.drawPathTileAtColRow(column, row, $scope.tid[$scope.tidIdx], $scope.rot);
                hexagon.drawSelectedTileSide(column, row, s, color[$scope.turnIndex]);
            }
        } catch(e){
            $log.info(["Cell is already full in position:", row, col]);
            return;
        }
    };

    $scope.makeMove = function () {
      if(!$scope.isYourTurn){
          return;
      }
      try{
        var row = $scope.token[$scope.turnIndex][0];
        var column = $scope.token[$scope.turnIndex][1];
        var moveObj = gameLogic.createMove($scope.board, $scope.token, row, column, $scope.tid[$scope.tidIdx], $scope.rot, $scope.turnIndex);
        $log.info(["Making move:", moveObj]);
        $scope.isYourTurn = false;
        sendMakeMove(moveObj);
      } catch(e){
          $log.info(["Cell is already full in position:", row, col]);
          return;
      }
    };

    function sendMakeMove(move){
        $log.info(["Making move:", move]);
        if (isLocalTesting) {
            stateService.makeMove(move);
        } else {
            messageService.sendMessage({makeMove: move});
        }
    };

    function updateUI(params) {
        $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
                            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        $scope.turnIndex = params.turnIndexAfterMove;
        console.log("updateUI " + $scope.turnIndex);

        $scope.jsonState = angular.toJson(params.stateAfterMove, true);
        $scope.board = params.stateAfterMove.board;
        $scope.token = params.stateAfterMove.token;
        $scope.tid[0] = params.stateAfterMove.t0;
        $scope.tid[1] = params.stateAfterMove.t1;
        $scope.tidIdx = 0;
        console.log("tileid: " + $scope.tid[0] + " " + $scope.tid[1]);

        if($scope.board === undefined){
            var init = gameLogic.getInitialBoard();
            $scope.board = init.board;
            $scope.token = init.token;
        }

        //draw path tile
        var rn = $scope.board.length;
        var cn = $scope.board[0].length;
        for(var r = 0; r < rn; r++){
            for(var c = 0; c < cn; c++){
                if($scope.board[r][c][0] !== -1){
                    var tid = $scope.board[r][c][0];
                    var rot = $scope.board[r][c][1];
                    console.log("drawing");
                    hexagon.drawPathTileAtColRow(c, r, tid, rot);
                }
            }
        }

        $scope.selTile();

        //draw token
        for(var p = 0; p < 2; p++){
          if($scope.token[p][0] != -1){
              var row    = $scope.token[p][0];
              var column = $scope.token[p][1];
              var s      = $scope.token[p][2];
              hexagon.drawSelectedTileSide(column, row, s, color[p]);
          }
        }

        if($scope.token[$scope.turnIndex][0] != -1){
            $scope.putToken = false;
        }
    }


    hexagon.init("canvas", 50);
    hexagon.drawHexGrid(8, 6, 50, 50, gameLogic.boardSize, false);

    $scope.tid = [0, 0];
    $scope.tidIdx = 0;
    $scope.rot = 0;
    $scope.putToken = true;

    var color = ["#FF0000", "#00FF00"];


    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});

    var game = {
      gameDeveloperEmail: "angieyayabird@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
    };

    scaleBodyService.scaleBody({width: 1000, height: 1000});
    var isLocalTesting = $window.parent === $window;

    if (isLocalTesting) {
      game.isMoveOk = gameLogic.isMoveOk;
      game.updateUI = updateUI;
      stateService.setGame(game);
    } else {
      messageService.addMessageListener(function (message) {
        if (message.isMoveOk !== undefined) {
          var isMoveOkResult = gameLogic.isMoveOk(message.isMoveOk);
          messageService.sendMessage({isMoveOkResult: isMoveOkResult});
        } else if (message.updateUI !== undefined) {
          updateUI(message.updateUI);
        }
      });

      messageService.sendMessage({gameReady : game});
    }
  });
