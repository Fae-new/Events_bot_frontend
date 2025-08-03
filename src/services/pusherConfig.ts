import Pusher from "pusher-js";

export const pusherConfig = {
  key: "754560ead10b09393310",
  cluster: "eu",
  forceTLS: true,
};

export const createPusherInstance = () => {
  return new Pusher(pusherConfig.key, {
    cluster: pusherConfig.cluster,
    forceTLS: pusherConfig.forceTLS,
  });
};
