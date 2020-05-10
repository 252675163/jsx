import { createApp, defineComponent, ref, Directive } from 'vue';
let VDemo: Directive = {
  mounted() {
    console.log('VDemo mounted');
  },
};
let ComponentA = defineComponent({
  props: {
    msg: String,
  },
  setup: (props) => {
    let count = ref(0);
    function add() {
      count.value++;
    }
    return () => {
      return (
        <div>
          <button onClick={add}>add 1</button>
          <div>count:{count.value}</div>
          <div>msg:{props.msg}</div>
        </div>
      );
    };
  },
});
export const App = createApp({
  render: () => {
    return (
      <ComponentA
        {...{
          directives: [
            {
              dir: VDemo,
            },
          ],
        }}
        msg="test"
      />
    );
  },
});
