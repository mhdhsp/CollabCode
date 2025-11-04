import * as signalR from "@microsoft/signalr";

class SignalRConnectionService {
  constructor() {
    this.connection = null;
    this.projectId = null;
  }

  async startConnection(projectId) {
    if (this.connection) {
      // If already connected to a project group, leave it before joining new
      if (this.projectId && this.projectId !== projectId) {
        await this.leaveGroup(this.projectId);
      }
      this.projectId = projectId;
      return; // already connected
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/project`, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.projectId = projectId;

    try {
      await this.connection.start();
      console.log("SignalR connected");
      await this.connection.invoke("JoinGroup", projectId.toString());
    } catch (err) {
      console.error("SignalR connection error:", err);
      throw err;
    }
  }

  async leaveGroup(projectId) {
    if (!this.connection) return;
    try {
      // SignalR has no built-in LeaveGroup method exposed here, so no client call.
      // But server can handle group removal on disconnect. 
      // You might implement a LeaveGroup hub method if needed.
      this.projectId = null;
    } catch (err) {
      console.error("SignalR leave group error:", err);
    }
  }

  onReceive(callback) {
    if (!this.connection) return;
    this.connection.on("Receive", callback);
  }

  async sendUpdate(projectId) {
    if (!this.connection) return;
    try {
      await this.connection.invoke("UpdateProject", projectId.toString());
    } catch (err) {
      console.error("SignalR sendUpdate error:", err);
    }
  }

  async stopConnection() {
    if (!this.connection) return;
    try {
      await this.connection.stop();
      this.connection = null;
      this.projectId = null;
    } catch (err) {
      console.error("SignalR stop connection error:", err);
    }
  }
}

// Export singleton instance
const signalRConnectionService = new SignalRConnectionService();
export default signalRConnectionService;