import type { MaidSanEvent, MappedEvents, Observer } from "../types";

export const createEventEmitter = <
  T,
  U extends Observer<T> = Observer<T>,
>() => {
  const observers = new Map<MaidSanEvent, U[]>();

  const send = async <W extends MaidSanEvent>(
    event: W,
    payload: MappedEvents<W>,
  ) => {
    const eventObservers = observers.get(event);

    if (!eventObservers) return;

    await Promise.all(
      eventObservers.map(async (o) => {
        await o(payload as unknown as T);
      }),
    );
  };

  const subscribe = <W extends MaidSanEvent>(
    event: W,
    _observer: Observer<MappedEvents<W>>,
  ) => {
    const eventObservers = observers.get(event);
    const observer = _observer as unknown as U;

    if (!eventObservers) {
      observers.set(event, [observer]);
      return;
    }

    eventObservers.push(observer);

    const unsubscribe = () => {
      observers.set(
        event,
        eventObservers.filter((o) => o !== observer),
      );
    };

    return unsubscribe;
  };

  return {
    send,
    subscribe,
  };
};
