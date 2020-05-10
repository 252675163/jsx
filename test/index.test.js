import { createApp, defineComponent, h } from 'vue';

test('render', () => {
  let dom = document.createElement('div');
  let ACC = defineComponent(() => () => <a>render</a>);
  createApp(ACC).mount(dom);
  expect(dom.innerHTML).toBe('<a>render</a>');
});
test('render2', () => {
  let dom = document.createElement('div');
  var ACC = defineComponent({
    setup: () => () => <span>render2</span>,
  });
  let a = {
    render() {
      return h(ACC);
    },
  };
  createApp(a).mount(dom);
  expect(dom.innerHTML).toBe('<span>render2</span>');
});
test('render3', () => {
  let dom = document.createElement('div');
  createApp({
    render: () => <span>render3</span>,
  }).mount(dom);

  expect(dom.innerHTML).toBe('<span>render3</span>');
});
test('render4', () => {
  let dom = document.createElement('div');
  let VDemo = {
    mounted() {
      console.log('VDemo mounted');
    },
  };
  let ACC = defineComponent(() => () => (
    <a
      {...{
        directives: [
          {
            dir: VDemo,
          },
        ],
      }}
    >
      render
    </a>
  ));
  createApp(ACC).mount(dom);
  expect(dom.innerHTML).toBe('<a>render</a>');
});
// test('render4', () => {
//   let dom = document.createElement('div');
//   var ACC = defineComponent({
//     render: () => <span>text12</span>,
//   });
//   let APP = {
//     setup: () => () => <ACC></ACC>,
//   };
//   createApp(APP).mount(dom);
//   expect(dom.innerHTML).toBe('<span>text12</span>');
// });
