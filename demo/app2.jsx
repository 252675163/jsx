import { createApp, defineComponent, ref } from 'vue';
var ACC = defineComponent({
  render: () => <span>text12</span>,
});
let APPObj = {
  setup: () => () => <ACC></ACC>,
};
export const App = createApp(APPObj);
