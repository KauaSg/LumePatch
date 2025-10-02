import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  loadItems,
  loadItemBatches,
  loadHistory,
  loadRetrainQueue,
  loadFilters,
  saveFilters,
  loadUIState,
  saveUIState,
} from "../services/persistence";
import {
  DEFAULT_ITEMS,
  DEFAULT_ITEM_MAP,
  DEFAULT_ITEM_BATCHES,
  DEFAULT_HISTORY,
  DEFAULT_RETRAIN_QUEUE,
} from "../constants/persistence";
import { createDemoData } from "../constants/demoData";

function hasDemoFlag() {
  if (typeof window === "undefined") return false;
  const searchParams = new URLSearchParams(window.location.search ?? "");
  if (searchParams.get("demo") === "1") return true;
  const hash = window.location.hash ?? "";
  const hashQueryIndex = hash.indexOf("?");
  if (hashQueryIndex >= 0) {
    const hashParams = new URLSearchParams(hash.slice(hashQueryIndex + 1));
    if (hashParams.get("demo") === "1") return true;
  }
  return false;
}

const DEMO_FLAG = hasDemoFlag();

const initialFilters = loadFilters();
const initialUIState = { ...loadUIState(), ...(DEMO_FLAG ? { demoMode: true } : {}) };

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(() => undefined);

const initialState = {
  ready: false,
  loading: true,
  items: DEFAULT_ITEMS,
  itemMap: { ...DEFAULT_ITEM_MAP },
  itemBatches: { ...DEFAULT_ITEM_BATCHES },
  history: DEFAULT_HISTORY,
  retrainQueue: DEFAULT_RETRAIN_QUEUE,
  detectionMode: "out",
  detectionPending: null,
  filters: initialFilters,
  ui: initialUIState,
  lastRefreshTs: Date.now(),
};

const ACTIONS = {
  HYDRATE: "HYDRATE",
  SET_LOADING: "SET_LOADING",
  SET_DETECTION_MODE: "SET_DETECTION_MODE",
  SET_PENDING_DETECTION: "SET_PENDING_DETECTION",
  UPSERT_ITEM: "UPSERT_ITEM",
  UPSERT_BATCHES: "UPSERT_BATCHES",
  SET_HISTORY: "SET_HISTORY",
  PREPEND_HISTORY: "PREPEND_HISTORY",
  SET_FILTERS: "SET_FILTERS",
  SET_UI: "SET_UI",
  SET_RETRAIN_QUEUE: "SET_RETRAIN_QUEUE",
  PREPEND_RETRAIN_ENTRY: "PREPEND_RETRAIN_ENTRY",
  REMOVE_RETRAIN_ENTRY: "REMOVE_RETRAIN_ENTRY",
};

function buildItemMap(items) {
  return (items || []).reduce((acc, item) => {
    if (item?.id) {
      acc[item.id] = { ...item };
    }
    return acc;
  }, {});
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE: {
      const { items, itemBatches, history, retrainQueue } = action.payload;
      const nextItems = items && items.length ? items : state.items;
      return {
        ...state,
        ready: true,
        loading: false,
        items: nextItems,
        itemMap: buildItemMap(nextItems),
        itemBatches: itemBatches ?? state.itemBatches,
        history: history ?? state.history,
        retrainQueue: retrainQueue ?? state.retrainQueue,
        lastRefreshTs: Date.now(),
      };
    }
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_DETECTION_MODE:
      return { ...state, detectionMode: action.payload };
    case ACTIONS.SET_PENDING_DETECTION:
      return { ...state, detectionPending: action.payload };
    case ACTIONS.UPSERT_ITEM: {
      const incoming = action.payload;
      const nextItems = state.items.some((item) => item.id === incoming.id)
        ? state.items.map((item) => (item.id === incoming.id ? { ...item, ...incoming } : item))
        : [...state.items, incoming];
      return {
        ...state,
        items: nextItems,
        itemMap: buildItemMap(nextItems),
      };
    }
    case ACTIONS.UPSERT_BATCHES: {
      const { itemId, batches } = action.payload;
      return {
        ...state,
        itemBatches: {
          ...state.itemBatches,
          [itemId]: [...(batches || [])],
        },
      };
    }
    case ACTIONS.SET_HISTORY:
      return { ...state, history: [...(action.payload || [])] };
    case ACTIONS.PREPEND_HISTORY:
      return { ...state, history: [action.payload, ...state.history] };
    case ACTIONS.SET_FILTERS:
      saveFilters(action.payload);
      return { ...state, filters: action.payload };
    case ACTIONS.SET_UI:
      saveUIState(action.payload);
      return { ...state, ui: action.payload };
    case ACTIONS.SET_RETRAIN_QUEUE:
      return { ...state, retrainQueue: [...(action.payload || [])] };
    case ACTIONS.PREPEND_RETRAIN_ENTRY:
      return { ...state, retrainQueue: [action.payload, ...state.retrainQueue] };
    case ACTIONS.REMOVE_RETRAIN_ENTRY:
      return {
        ...state,
        retrainQueue: state.retrainQueue.filter((entry) => entry.id !== action.payload),
      };
    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let aborted = false;
    async function bootstrap() {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      try {
        const [items, itemBatches, history, retrainQueue] = await Promise.all([
          loadItems(),
          loadItemBatches(),
          loadHistory(),
          loadRetrainQueue(),
        ]);

        if (!aborted) {
          let itemsData = items;
          let batchesData = itemBatches;
          let historyData = history;
          let retrainData = retrainQueue;

          if (DEMO_FLAG) {
            const demo = createDemoData();
            itemsData = demo.items;
            batchesData = demo.itemBatches;
            historyData = demo.history;
            retrainData = demo.retrainQueue;
          }

          dispatch({
            type: ACTIONS.HYDRATE,
            payload: {
              items: itemsData,
              itemBatches: batchesData,
              history: historyData,
              retrainQueue: retrainData,
            },
          });
        }
      } finally {
        if (!aborted) {
          dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
      }
    }
    bootstrap();
    return () => {
      aborted = true;
    };
  }, []);

  const stateValue = state;
  const dispatchValue = useMemo(() => dispatch, [dispatch]);

  return (
    <AppStateContext.Provider value={stateValue}>
      <AppDispatchContext.Provider value={dispatchValue}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === null) {
    throw new Error("useAppState deve ser usado dentro de AppStateProvider");
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === null) {
    throw new Error("useAppDispatch deve ser usado dentro de AppStateProvider");
  }
  return context;
}

export { ACTIONS as APP_ACTIONS };
