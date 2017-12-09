import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentState: string[] = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
  playerTurn: boolean = true;
  message: string = ''; //Display Who wins or Tie
  diffculty: string ='Hard';

  constructor(public navCtrl: NavController) {

  }

  //Many Function where everytime players Click on a Tile will be called
  tick = async (index) => {
    //Check if the index of the button  clicked  is empty and it's the player turn to play
    if (this.currentState[index] == ' ' && this.playerTurn) {
      this.playerTurn = false;
      this.currentState[index] = await 'O'; //Write O in the tile
      if (!this.checkIfSomeoneWins()) { //This functions checks if somebody won or tie
        //Nobody won or is not a tie
        //This function is the A.I who gonna play next.
        this.computerTurn();
      }
    }
  }

  //A.I will play X on a tile .
  computerTurn = async () => {
    // Get the possible child states from the current state and returns it as a Node Array ( Check Class Node bottom of File)
    let nodes: Node[] = await this.generateNextStates(this.currentState, 'X');
    //For Each child state ( Now as Nodes which contain the state plus other values)
    for (let i = 0; i < nodes.length; i++) {
      //Calculate it's Heirustec
      nodes[i].heirustec = this.totalHeirustec(nodes[i].state);
      //Check if this state is a win state for the A.I
      //Meaning if the A.I picks this state he will win .
      nodes[i].isWin = this.isWin(nodes[i].state, 'X');
      //Get child states of the current state to check if it will lead to player victory
      let tmpStates = await this.generateNextStates(nodes[i].state, 'O');
      //For each these child states of the state
      for (let j = 0; j < tmpStates.length; j++) {
        //Check if the player win in any of it 
        //If true , mark this state with isLeadToLose to true to avoid it
        if (this.isWin(tmpStates[j].state, 'O')) {
          nodes[i].isLeadToLose = true;
        }
        //If Diffculty is Impossible we Go 1 Step Deeper to Check if the State will lead
        //To a Dead End Guaranteed loss .
        else if(this.diffculty == 'Impossible'){
          // Create all child states (possible computer moves) from each possible 
          // player moves state (We are still inside the player possible move states loop).
          let deepNodes: Node[] = await this.generateNextStates(tmpStates[j].state, 'X');
          //For Each computer state after the possible player next moves state 
          for(let k = 0 ; k < deepNodes.length ; k++){
            /* 
              Create another possible Player move state
              Simply we are going like this :
              Computer Moves List --For Each--> Player Moves List --For Each--> Computer Moves List --For Each--> Player Moves List
            */
            let tmpDeepStates = await this.generateNextStates(deepNodes[k].state, 'O');
            //Number of States That Player Wins
            //Basically If a computer moves that lead to two possible player win states that means
            //Computer should avoid this move , You can't block two Possible win States in one move.
            let numberOfLossStates:number = 0;     
            for(let d = 0 ; d < tmpDeepStates.length ; d++){
              if (this.isWin(tmpDeepStates[d].state, 'O')) {
                numberOfLossStates++;
              }
            }
            //If Player possible move states is greater than 1 we should avoid it .
            if(numberOfLossStates > 1){
              nodes[i].isLeadToLose = true;
            }
          }

        }
      }
      
    }
    //Sort nodes ( State ) by Heirustec 
    let newNodes: Node[] = await nodes.sort((n1, n2) => n2.heirustec - n1.heirustec);
    //This will return the best state to play
    let bestState: string[] = this.decideState(newNodes);
    //Make the current state the best state which represent A.I moves.
    this.currentState = bestState;
    //Check if anyone won or Tie 
    if (!this.checkIfSomeoneWins()) {
      //If not , it's the player turn .
      this.playerTurn = true;
    }

  }

  //This Function will return all possible child states as Array of Node objects .
  //Recieves a State (Childs will be created from ) & ether X or O (Create possible states of X or O )
  generateNextStates = (state: string[], mark: string) => {
    let nodes = [];
    //Iterate over all the 9 position of the state and  add X/O in empty slot
    for (let i = 0; i < state.length; i++) {
      if (state[i] == ' ') {
        let tmpState = state.slice(0); //Copy the Array contents from index 0 .
        tmpState[i] = mark;
        nodes.push(new Node(tmpState)); //Create a new node with the created state
      }
    }
    return nodes;
  }

  //This function calculate the Total Heirustec for the given state
  totalHeirustec = (state: string[]) => {
    let computerHeirustec = this.calculateHeirustec(state, 'X');
    let humenHeirustec = this.calculateHeirustec(state, 'O');

    return (computerHeirustec - humenHeirustec);
  }
  //This function calculate the Heirustec for the given state and if it's for X (computer) or O (player)
  calculateHeirustec = (state: string[], mark: string) => {
    let Heirustec = 0;
    /*Basically we check all the possible win moves by checking if it's combinations does not contain
     The other mark (if for X , the combinations does not contains O , vice versa ). By checking if it's
     the mark or empty .
    */
    /*
      map of the Tick Tac Toe indexes

      0  |  1  |  2
      3  |  4  |  5
      6  |  7  |  8

    */
    // Nested If since if the first of this win situation combination is not the mark or empty then no need to check further
    // i.e ( We are X )the top left is O , that means the first rows , first column and cross left to right is not possible 
    // Win moves .
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


  //This  function checks if the given state is a win for the given mark X/O
  isWin = (state: string[], mark: string) => {
    //This we check every possible win moves (Total 8) one by one
    //Once it discovers a win it will return true , else will return false.
    if (state[0] == mark && state[1] == mark && state[2] == mark) {
      return true;
    }
    if (state[0] == mark && state[3] == mark && state[6] == mark) {
      return true;
    }
    if (state[0] == mark && state[4] == mark && state[8] == mark) {
      return true;
    }
    if (state[1] == mark && state[4] == mark && state[7] == mark) {
      return true;
    }
    if (state[2] == mark && state[5] == mark && state[8] == mark) {
      return true;
    }
    if (state[2] == mark && state[4] == mark && state[6] == mark) {
      return true;
    }
    if (state[3] == mark && state[4] == mark && state[5] == mark) {
      return true;
    }
    if (state[6] == mark && state[7] == mark && state[8] == mark) {
      return true;
    }
    return false;
  }

  /* 
    This function will decide which state to play for the computer from the given nodes
    (Which all it's Heirustec calculated and if it's a win and it leads to a lose and also it's sorted by heirustec)
  */
  decideState = (nodes: Node[]) => {
    //First we iterate to finds a state which will make the computer wins.
    //if found it will be returned .
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isWin) {
        return nodes[i].state;
      }
    }
    //If no states that makes the computer wins found we then 
    //Select the first state that does not lead to a loss
    // In Other word , The Best State that does not make me lose .
    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].isLeadToLose) {
        return nodes[i].state;
      }
    }
    return nodes[0].state;
  }

  checkIfSomeoneWins = () => {
    let playerWins: boolean = this.isWin(this.currentState, 'O');
    let computerWins: boolean = this.isWin(this.currentState, 'X');
    let isTie: boolean = this.isTie();
    if (playerWins) {
      this.message = "Player Won !";
      return true;
    }
    else if (computerWins) {
      this.message = "Computer Won !";
      return true;
    }
    else if (isTie) {
      this.message = "Tie !";
      return true;
    }
  }

  isTie = () => {
    for (let i = 0; i < this.currentState.length; i++) {
      if (this.currentState[i] == ' ') {
        return false;
      }
    }
    return true;
  }

  restart = (start: string) => {
    this.currentState = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    this.message = ' ';
    if (start == 'computer') {
      this.playerTurn = false;
      this.computerTurn();
    }
    else {
      this.playerTurn = true;
    }
  }

  changeDiffculty = () => {
    if(this.diffculty =='Hard'){
      this.diffculty = 'Impossible'
    }
    else{
      this.diffculty ='Hard'
    }
  }

}

class Node {
  public state: string[];
  public heirustec: number;
  public isLeadToLose: boolean = false;
  public isWin: boolean = false;

  constructor(state: string[]) {
    this.state = state;
  }

}
