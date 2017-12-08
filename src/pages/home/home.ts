import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentState:string[] = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
  playerTurn: boolean = true;
  message:string='';
  turn:number =0;
  constructor(public navCtrl: NavController) {

  }

  tick = async (index) => {
    if (this.currentState[index] == ' ' && this.playerTurn) {
      this.playerTurn = false;
      this.currentState[index] = await 'O';
      if(!this.checkIfSomeoneWins()){
        this.computerTurn();
      }
    }
  }

  computerTurn = async () => {
    if(this.turn == 0 ){
      if(this.currentState[4] == ' '){
        this.currentState[4] = 'X';
      }
      else{
        this.currentState[0] = 'X';
      }
      this.turn = 2;
      this.playerTurn = true;
    }
    else{
      let nodes: Node[] = await this.generateNextStates(this.currentState , 'X');
      await nodes.forEach(x => {
        x.heirustec = this.totalHeirustec(x.state);
        x.isWin = this.isWin(x.state , 'X');
      })
      for(let i = 0 ; i < nodes.length ; i++){
        let tmpStates = await this.generateNextStates(nodes[i].state , 'O');
        for(let j = 0 ; j < tmpStates.length ; j++) {
          if(this.isWin(tmpStates[j].state,'O')){
            nodes[i].isLeadToLose = true;
          }
        }
      }
      let newNodes:Node[] = await nodes.sort((n1,n2) => n2.heirustec - n1.heirustec);
      let bestState:string[] = this.decideState(newNodes);
      this.currentState = bestState;
      if(!this.checkIfSomeoneWins()){
        this.playerTurn = true;
      } 
    }
  }

  generateNextStates = (state: string[],mark:string) => {
    let nodes = [];
    for (let i = 0; i < state.length; i++) {
      if (state[i] == ' ') {
        let tmpState = state.slice(0);
        tmpState[i] = mark;
        nodes.push(new Node(tmpState));
      }
    }
    return nodes;
  }

  totalHeirustec =  (state: string[]) => {
    let computerHeirustec =  this.calculateHeirustec(state,'X');
    let humenHeirustec =  this.calculateHeirustec(state,'O');

    return(computerHeirustec - humenHeirustec);
  }

  calculateHeirustec = (state: string[], mark: string) => {
    let Heirustec = 0;

    /*
      map of the Tick Tac Toe indexes

      0  |  1  |  2
      3  |  4  |  5
      6  |  7  |  8

    */
    if (state[0] == mark || state[0] == ' ') {
      //if    o | o | o or x | x | x first row
      if ((state[1] == mark || state[1] == ' ') && (state[2] == mark || state[2] == ' ')) {
        Heirustec++;
      }
      /* if  o or x  first col
             o    x
             o    x
      */
      if ((state[3] == mark || state[3] == ' ') && (state[6] == mark || state[6] == ' ')) {
        Heirustec++;
      }
      /* if | o|            
               | o |   
                   | o |   
      */
      if ((state[4] == mark || state[4] == ' ') && (state[8] == mark || state[8] == ' ')) {
        Heirustec++;
      }
    }
    // Second Col
    if (state[1] == mark || state[1] == ' ') {
      if ((state[4] == mark || state[4] == ' ') && (state[7] == mark || state[7] == ' ')) {
        Heirustec++;
      }
    }
    //Third Col && Cross from Right to Left
    if (state[2] == mark || state[2] == ' ') {
      if ((state[5] == mark || state[5] == ' ') && (state[8] == mark || state[8] == ' ')) {
        Heirustec++;
      }
      if ((state[4] == mark || state[4] == ' ') && (state[6] == mark || state[6] == ' ')) {
        Heirustec++;
      }
    }
    // Second Row
    if (state[3] == mark || state[3] == ' ') {
      if ((state[4] == mark || state[4] == ' ') && (state[5] == mark || state[5] == ' ')) {
        Heirustec++;
      }
    }
    // Third Row
    if (state[6] == mark || state[6] == ' ') {
      if ((state[7] == mark || state[7] == ' ') && (state[8] == mark || state[8] == ' ')) {
        Heirustec++;
      }
    }

    return Heirustec;
  }

 

  isWin = (state: string[] , mark:string) => {
    if(state[0] == mark && state[1] == mark && state[2]== mark){
      return true;
    }
    if(state[0] == mark && state[3] == mark && state[6]== mark){
      return true;
    }
    if(state[0] == mark && state[4] == mark && state[8]== mark){
      return true;
    }
    if(state[1] == mark && state[4] == mark && state[7]== mark){
      return true;
    }
    if(state[2] == mark && state[5] == mark && state[8]== mark){
      return true;
    }
    if(state[2] == mark && state[4] == mark && state[6]== mark){
      return true;
    }
    if(state[3] == mark && state[4] == mark && state[5]== mark){
      return true;
    }
    if(state[6] == mark && state[7] == mark && state[8]== mark){
      return true;
    }
    return false;
  }

  decideState = (nodes:Node[]) =>{
    console.log("New Turn")
    for(let i = 0 ; i < nodes.length ; i++){
      console.log(nodes[i].heirustec)
      if(nodes[i].isWin){
        return nodes[i].state;
      }
    }
    for(let i = 0 ; i < nodes.length ; i++){
      if(!nodes[i].isLeadToLose){
        return nodes[i].state;
      }
    }
    return nodes[0].state;
  }

  checkIfSomeoneWins = () => {
    let playerWins:boolean = this.isWin(this.currentState,'O');
    let computerWins:boolean = this.isWin(this.currentState,'X');
    let isTie:boolean = this.isTie();
    if(playerWins){
      this.message="Player Won !";
      return true;
    }
    else if(computerWins){
      this.message="Computer Won !";
      return true;
    }
    else if(isTie){
      this.message="Tie !";
      return true;
    }
  }

  isTie = () => {
    for(let i = 0 ; i < this.currentState.length ; i++){
      if(this.currentState[i] == ' '){
        return false;
      }
    }
    return true;
  }
}

class Node {
  public state:string[];
  public heirustec: number;
  public isLeadToLose: boolean = false;
  public isWin: boolean = false;

  constructor(state: string[]) {
    this.state = state;
  }

}
