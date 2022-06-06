import Vue from 'vue';
import message from '@/assets/js/message';
import TodoListProxy from '@/proxies/TodoListProxy';
import RecListProxy from '@/proxies/RecListProxy';
import CompleteListProxy from '@/proxies/CompleteListProxy';
import { router } from '@/plugins/vue-router';

// 페이지네이션을 초기화를 위해 vuex.list에서 공통으로 사용하는 함수
function setPagenation(payload) {
  // 홈화면에서 해당 일정화면 이동시에 일정을 20개를 표시하므로 현재페이지를 2페이지로 설정
  const responseData = payload.response.data;
  const pageNation = { hasNext: responseData.has_next, currentPage: responseData.current_page };
  // 일정을 20개 표시하는 경우 현재페이지를 2로 설정하고 아닌 경우 1로 설정
  if (payload?.get20perpage) pageNation.currentPage = payload.get20perpage ? 2 : 1;
  return pageNation;
}

export default {
  state: {
    // todolist: [{ postId: '1', title: '타이틀1' }, { postId: '2', title: '타이틀2' }], // 표시용 리스트
    // completelist: [{ postId: '3', title: '타이틀3' }, { postId: '4', title: '타이틀4' }], // 표시용 리스트
    todolist: [], // 할일 일정 (표시용)
    reclist: [], // 추천 일정 (표시용)
    completelist: [], // 완료 일정 (표시용)
    todolistPage: { currentPage: 1, hasNext: false }, // 할일 일정 페이지네이션
    reclistPage: { currentPage: 1, hasNext: false }, // 추천 일정 페이지네이션
    completelistPage: { currentPage: 1, hasNext: false }, // 완료 일정 페이지네이션
    reclistCount: 0, // 추천일정의 총건수
    todolistCount: 0, // 할일일정의 총건수
    completelistCount: 0, // 완료일정의 총건수
  },
  mutations: {
    // 일정초기화
    setTodoList(state, payload) {
      state.todolist = payload;
    },
    setRecList(state, payload) {
      state.reclist = payload;
    },
    setCompleteList(state, payload) {
      state.completelist = payload;
    },
    // 페이지네이션 초기화
    setTodoListPage(state, payload) {
      state.todolistPage = setPagenation(payload);
    },
    setRecListPage(state, payload) {
      state.reclistPage = setPagenation(payload);
    },
    setCompleteListPage(state, payload) {
      state.completelistPage = setPagenation(payload);
    },
    // 추천일정의 총일정수 초기화
    setRecListCount(state, payload) {
      state.reclistCount = payload;
    },
    // 할일일정의 총일정수 초기화
    setTodoListCount(state, payload) {
      state.todolistCount = payload;
    },
    // 완료일정의 총일정수 초기화
    setCompleteListCount(state, payload) {
      state.completelistCount = payload;
    },
  },
  actions: {
    // 홈화면에서 할일일정과 추천일정을 초기화
    setInitHomeList() {
      // 할일일정화면과 추천일정화면에서 2번 호출되는걸 막기 위한 처리
      if (router.currentRoute.path === '/') {
        // 홈화면의 할일일정 초기화 (표시용)
        this.dispatch('setInitTodoList');
        // 홈화면의 추천일정 초기화 (표시용)
        this.dispatch('setInitRecList');
        // 홈화면의 완료일정 초기화 (표시용)
        this.dispatch('setInitCompleteList');
      }
    },

    // 추천일정 초기화
    setInitRecList({ commit }, payload) {
      const { selection } = this.getters;
      const get20perpage = !!payload; // 홈화면에서 해당일정화면으로 이동시 최초 일정을 20개를 표시한다
      const selectionWithPage = { ...selection, get20perpage };
      // 추천일정 추가
      // 추천일정정보 취득
      new RecListProxy()
        .getRecList(selectionWithPage)
        .then((response) => {
          // 서버에서 가져온 추천일정을 초기화
          commit('setRecList', response.data.my_reclist);
          // 서버에서 가져온 추천일정의 총 일정 수 초기화
          commit('setRecListCount', response.data.total_count);
          // 페이지네이션 정보초기화 (다음 페이지 유무, 20페이지표시 유무를 매개변수로 전달)
          commit('setRecListPage', { response, get20perpage });
        })
        .catch(() => {
          console.log('Request failed...');
        });
    },

    // 추천일정 가져오기 (페이지네이션)
    getRecList({ commit }) {
      const { selection, reclistPage } = this.getters;
      const selectionWithPage = { ...selection, ...reclistPage };
      // 추천일정 추가
      // 추천일정정보 취득
      new RecListProxy()
        .getRecList(selectionWithPage)
        .then((response) => {
          // 서버에서 가져온 추천일정을 초기화
          commit('setRecList', [...this.getters.reclist, ...response.data.my_reclist]);
          // 페이지네이션 정보초기화
          commit('setRecListPage', { response });
        })
        .catch(() => {
          console.log('Request failed...');
        });
    },

    // 할일일정 초기화
    setInitTodoList({ commit }, payload) {
      const { selection } = this.getters;
      const get20perpage = !!payload; // 홈화면에서 해당일정화면으로 이동시 최초 일정을 20개를 표시한다
      const selectionWithPage = { ...selection, get20perpage };

      // 로컬스토리지의 정보로 초기화
      new TodoListProxy()
        .getTodoList(selectionWithPage)
        .then((response) => {
          // 서버에서 가져온 할일일정을 초기화
          commit('setTodoList', response.data.my_todolist);
          // 서버에서 가져온 할일일정의 총 일정 수 초기화
          commit('setTodoListCount', response.data.total_count);
          // 페이지네이션 정보초기화 (다음 페이지 유무, 20페이지표시 유무를 매개변수로 전달)
          commit('setTodoListPage', { response, get20perpage });
        })
        .catch(() => {
          console.log('Request failed...');
        });
    },

    // 할일일정 가져오기 (페이지네이션)
    getTodoList({ commit }) {
      const { selection, todolistPage } = this.getters;
      const selectionWithPage = { ...selection, ...todolistPage };
      // 할일일정 추가
      // 할일일정정보 취득
      new TodoListProxy()
        .getTodoList(selectionWithPage)
        .then((response) => {
          // 서버에서 가져온 할일일정을 초기화
          commit('setTodoList', [...this.getters.todolist, ...response.data.my_todolist]);
          // 페이지네이션 정보초기화 (다음 페이지 유무, 20페이지표시 유무를 매개변수로 전달)
          commit('setTodoListPage', { response });
        })
        .catch(() => {
          console.log('Request failed...');
        });
    },

    // 완료 일정 초기화
    setInitCompleteList({ commit }, payload) {
      const { selection } = this.getters;
      const get20perpage = !!payload; // 홈화면에서 해당일정화면으로 이동시 최초 일정을 20개를 표시한다
      const selectionWithPage = { ...selection, ...get20perpage };

      // 완료 일정 추가
      // 완료일정정보 취득
      new CompleteListProxy()
        .getCompleteList(selectionWithPage)
        .then((response) => {
          // 완료일정 초기화 (hidden 프라퍼티 추가)
          const completeList = response.data.my_completelist.map((e) => ({ ...e, hidden: true }));
          // 서버에서 가져온 완료일정을 초기화
          commit('setCompleteList', completeList);
          // 서버에서 가져온 완료일정의 총 일정 수 초기화
          commit('setCompleteListCount', response.data.total_count);
          // 페이지네이션 정보초기화 (다음 페이지 유무, 20페이지표시 유무를 매개변수로 전달)
          commit('setCompleteListPage', { response, get20perpage });
        })
        .catch(() => {
          console.log('Request failed...');
        });
    },

    // 완료일정 가져오기 (페이지네이션)
    getCompleteList({ commit }) {
      const { selection, completelistPage } = this.getters;
      const selectionWithPage = { ...selection, ...completelistPage };

      // 완료 일정 추가
      // 완료일정정보 취득
      new CompleteListProxy()
        .getCompleteList(selectionWithPage)
        .then((response) => {
          // 완료일정 초기화 (hidden 프라퍼티 추가)
          const completeList = response.data.my_completelist.map((e) => ({ ...e, hidden: true }));
          // 서버에서 가져온 완료일정을 초기화
          commit('setCompleteList', [...this.getters.completelist, ...completeList]);
          // 페이지네이션 정보초기화 (다음 페이지 유무, 20페이지표시 유무를 매개변수로 전달)
          commit('setCompleteListPage', { response });
        })
        .catch(() => {
          console.log('Request failed...');
        });
    },

    // 모든 일정 초기화 (모든 일정은 페이지네이션이 없다)
    setInitAllList({ commit }) {
      const { selection } = this.getters;
      const selectionWithPage = { ...selection };
      selectionWithPage.getAllPages = true; // 모든 일정에선 모든 일정을 표시한다

      // 할일일정정보 취득
      const setInitTodoList = new TodoListProxy()
        .getTodoList(selectionWithPage);

      // 완료일정정보 취득
      const setInitCompleteList = new CompleteListProxy()
        .getCompleteList(selectionWithPage);

      // 모든일정정보 취득
      Promise.all([setInitTodoList, setInitCompleteList]).then((response) => {
        // 서버에서 가져온 할일일정을 초기화
        commit('setTodoList', response[0].data.my_todolist);
        // 서버에서 가져온 할일일정의 총 일정 수 초기화
        commit('setTodoListCount', response[0].data.total_count);
        // 서버에서 가져온 완료일정을 초기화 (hidden 프라퍼티 추가)
        const completeList = response[1].data.my_completelist.map((e) => ({ ...e, hidden: true }));
        // 서버에서 가져온 완료일정을 초기화
        commit('setCompleteList', completeList);
        // 서버에서 가져온 완료일정의 총 일정 수 초기화
        commit('setCompleteListCount', response[1].data.total_count);
      }).catch(() => {
        console.log('Request failed...');
      });
    },

    // 선택한 리스트를 추가, 삭제
    updateList(_, payload) {
      const checkedItem = payload;

      if (checkedItem.isAdded) {
        // 추가모드
        this.dispatch('addList', checkedItem);
      } else {
        // 삭제모드
        this.dispatch('removeList', checkedItem);
      }
    },

    // 일정 추가
    addList({ commit }, payload) {
      const { selection } = this.getters;
      const { listKind } = payload; // 클릭한 리스트 종류
      const isLogined = this.getters.user; // 로그인 유무
      const checkedItem = { postId: payload.postId }; // 입력값

      // 로그인상태일시
      if (isLogined) {
        // TODO axios 리스트별 추가 삭제 찰;
      } else {
        // 미로그인시
        if (listKind === 'rec') {
          // 추천일정화면에서 추가
          // 중복된 일정이 아니라면 할일 일정에 추가 (일정을 뒤에 추가)
          selection.myTodolist = [...selection.myTodolist.filter((e) => e.postId !== checkedItem.postId), checkedItem];
          // 할일일정과 완료일정 초기화
          this.dispatch('setInitRecList');
          this.dispatch('setInitTodoList');
          Vue.prototype.$toast.info(message.addList);
        } else if (listKind === 'todo') {
          // 할일일정화면에서 추가
          // 중복된 일정이 아니라면 완료 일정에 추가 (일정을 앞에 추가)
          selection.myCompletelist = [checkedItem, ...selection.myCompletelist.filter((e) => e.postId !== checkedItem.postId)];
          // 할일 일정에서 삭제
          selection.myTodolist = [...selection.myTodolist.filter((e) => e.postId !== checkedItem.postId)];
          // 할일일정 초기화
          this.dispatch('setInitTodoList');
          // 완료일정 초기화
          this.dispatch('setInitCompleteList');
          Vue.prototype.$toast.info(message.completeList);
        } else if (listKind === 'all_todo') {
          // 모든일정화면에서 할일추가
          // 중복된 일정이 아니라면 완료 일정에 추가 (일정을 앞에 추가)
          selection.myCompletelist = [checkedItem, ...selection.myCompletelist.filter((e) => e.postId !== checkedItem.postId)];
          // 할일 일정에서 삭제
          selection.myTodolist = [...selection.myTodolist.filter((e) => e.postId !== checkedItem.postId)];
          // 모든일정 초기화
          this.dispatch('setInitAllList');
          Vue.prototype.$toast.info(message.completeList);
        }
        window.localStorage.setItem('selection', JSON.stringify(selection));
      }
      commit('setSelection', selection);
    },

    // 일정 삭제
    removeList({ commit }, payload) {
      const { selection } = this.getters;
      const { listKind } = payload; // 클릭한 리스트 종류
      const isLogined = this.getters.user; // 로그인 유무
      const checkedItem = { postId: payload.postId }; // 입력값

      // 로그인상태일시
      if (isLogined) {
        // TODO axios 리스트별 추가 삭제 찰;
      } else {
        // 미로그인시
        if (listKind === 'todo') {
          // 할일일정화면에서 완료일정 삭제
          // 할일일정삭제
          selection.myTodolist = [...selection.myTodolist.filter((e) => e.postId !== checkedItem.postId)];
          // 할일일정 초기화
          this.dispatch('setInitRecList');
          // 완료일정 초기화
          this.dispatch('setInitTodoList');
        } else if (listKind === 'complete') {
          // 완료일정화면에서 완료일정 삭제
          // 완료일정 삭제
          selection.myCompletelist = [...selection.myCompletelist.filter((e) => e.postId !== checkedItem.postId)];
          // 할일일정 초기화
          this.dispatch('setInitTodoList');
          // 완료일정 초기화
          this.dispatch('setInitCompleteList');
        } else if (listKind === 'all_todo') {
          // 모든일정화면에서 할일일정 삭제
          // 할일일정삭제
          selection.myTodolist = [...selection.myTodolist.filter((e) => e.postId !== checkedItem.postId)];
          // 모든일정 초기화
          this.dispatch('setInitAllList');
        } else if (listKind === 'all_complete') {
          // 모든일정화면에서 완료일정 삭제
          // 완료일정삭제
          selection.myCompletelist = [...selection.myCompletelist.filter((e) => e.postId !== checkedItem.postId)];
          // 모든일정 초기화
          this.dispatch('setInitAllList');
        }
        window.localStorage.setItem('selection', JSON.stringify(selection));
      }
      Vue.prototype.$toast.info(message.removeList);
      commit('setSelection', selection);
    },
  },
  getters: {
    todolist(state) {
      return state.todolist;
    },
    reclist(state) {
      return state.reclist;
    },
    completelist(state) {
      return state.completelist;
    },
    alllist(state) {
      return [...state.todolist, ...state.completelist];
    },
    todolistPage(state) {
      return state.todolistPage;
    },
    reclistPage(state) {
      return state.reclistPage;
    },
    completelistPage(state) {
      return state.completelistPage;
    },
    reclistCount(state) {
      return state.reclistCount;
    },
    todolistCount(state) {
      return state.todolistCount;
    },
    completelistCount(state) {
      return state.completelistCount;
    },
  },
};
