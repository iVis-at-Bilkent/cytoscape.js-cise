const ContinuousLayout = require('../continuous-base');
const assign = require('../assign');
const isFn = fn => typeof fn === 'function';

const optFn = ( opt, ele ) => {
  if( isFn( opt ) ){
    return opt( ele );
  } else {
    return opt;
  }
};

const defaults = {}; // TODO define

class Layout extends ContinuousLayout {
  constructor( options ){
    super( assign( {}, defaults, options ) );
  }

  prerun(){
    let state = this.state; // options object combined with current state

    // regular nodes
    state.nodes.forEach( n => {
      let scratch = this.getScratch( n ); // per-element layout data/state, x/y, etc.

      // example of setting per-element state based on an option value/function
      scratch.foo = optFn( state.foo, n );
    } );

    // regular edge springs
    state.edges.forEach( e => {
      let scratch = this.getScratch( e ); // per-element layout data/state, x/y, etc.

      // example of setting per-element state based on an option value/function
      scratch.foo = optFn( state.foo, e );
    } );
  }

  // run this each iteraction
  tick(){
    let state = this.state;
    let isDone = true;

    // TODO update state for this iteration

    state.nodes.forEach( n => {
      let s = this.getScratch(n);

      // example : put node at random position
      s.x = Math.random() * 100;
      s.y = Math.random() * 100;
    } );

    return isDone;
  }

  // run this function after the layout is done ticking
  postrun(){

  }

  // clean up any object refs that could prevent garbage collection, etc.
  destroy(){
    super.destroy();

    return this;
  }
}

module.exports = Layout;
