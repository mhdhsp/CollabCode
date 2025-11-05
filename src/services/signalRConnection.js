import * as signalR from "@microsoft/signalr";

class SignalRConnectionService {
  constructor() {
    this.connection = null;
    this.projectId = null;
    this.onReceiveCallback = null;
  }

  async startConnection(projectId) {
    console.log("SignalR: startConnection", projectId);

    // Same project → already joined
    if (this.connection && this.projectId === projectId) {
      console.log("SignalR: already in group", projectId);
      return;
    }

    // Different project → leave old group, keep connection
    if (this.connection && this.projectId !== projectId) {
      console.log("SignalR: switching from", this.projectId, "to", projectId);
      await this.leaveGroup(this.projectId);
    }

    // No connection → create once
    if (!this.connection) {
      console.log("SignalR: building new connection");
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_BASE_URL}/hubs/chat`, {
          withCredentials: true,
          accessTokenFactory:()=>localStorage.getItem("token")
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on("Receive", (msg) => {
        console.log("SignalR: raw Receive", msg);
        if (this.onReceiveCallback) this.onReceiveCallback(msg);
      });

      try {
        await this.connection.start();
        console.log("SignalR: connected");
      } catch (e) {
        console.error("SignalR: start error", e);
        throw e;
      }
    }

    // Join the new group
    this.projectId = projectId;
    
    await this.connection.invoke("JoinGroup", projectId.toString());
    console.log("SignalR: joined group", projectId);
  }

  onReceive(cb) {
    this.onReceiveCallback = cb;
  }

  async leaveGroup(projectId) {
    console.log(projectId);
    
    if (!this.connection) return;
    try {
      await this.connection.invoke("LeaveGroup", projectId.toString());
      console.log("SignalR: left group", projectId);
    } catch (e) {
      console.error("SignalR: leaveGroup error", e);
    }
  }

  async stopConnection() {
    if (!this.connection) return;
    try {
      await this.connection.stop();
      console.log("SignalR: stopped");
    } catch (e) {
      console.error("SignalR: stop error", e);
    } finally {
      this.connection = null;
      this.projectId = null;
    }
  }
}

const signalRConnectionService = new SignalRConnectionService();
export default signalRConnectionService;