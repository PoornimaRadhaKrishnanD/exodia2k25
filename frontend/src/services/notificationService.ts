export interface LoginNotification {
  id: string;
  userId: string;
  userName: string;
  loginTime: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export class NotificationService {
  private static notifications: any[] = [];

  // Add a login notification
  static addLoginNotification(user: any): void {
    const loginTime = new Date();
    
    // Store in localStorage temporarily (in real app, this would go to backend)
    const existingNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    
    const loginNotification = {
      id: `login-${Date.now()}`,
      type: 'login',
      title: 'Login Successful',
      message: `Welcome back! You logged in at ${loginTime.toLocaleTimeString()}`,
      timestamp: loginTime.toISOString(),
      read: false,
      priority: 'medium',
      userId: user._id || user.id,
      userName: user.name
    };

    const updatedNotifications = [loginNotification, ...existingNotifications.slice(0, 49)]; // Keep only last 50
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('newNotification', { detail: loginNotification }));
  }

  // Add tournament notification
  static addTournamentNotification(tournament: any, type: 'created' | 'joined' | 'reminder' | 'result'): void {
    const notification = {
      id: `tournament-${type}-${Date.now()}`,
      type: 'tournament',
      title: this.getTournamentNotificationTitle(type),
      message: this.getTournamentNotificationMessage(type, tournament),
      timestamp: new Date().toISOString(),
      read: false,
      priority: type === 'reminder' ? 'high' : 'medium',
      tournamentId: tournament.id || tournament._id
    };

    this.addNotification(notification);
  }

  // Add payment notification
  static addPaymentNotification(amount: number, status: 'success' | 'failed', tournamentName?: string): void {
    const notification = {
      id: `payment-${status}-${Date.now()}`,
      type: 'payment',
      title: status === 'success' ? 'Payment Successful' : 'Payment Failed',
      message: status === 'success' 
        ? `Payment of ₹${amount} processed successfully${tournamentName ? ` for ${tournamentName}` : ''}`
        : `Payment of ₹${amount} failed. Please try again.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: status === 'failed' ? 'high' : 'medium'
    };

    this.addNotification(notification);
  }

  // Add achievement notification
  static addAchievementNotification(achievement: string, description: string): void {
    const notification = {
      id: `achievement-${Date.now()}`,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${achievement}: ${description}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high'
    };

    this.addNotification(notification);
  }

  // Get all notifications for current user
  static getNotifications(): any[] {
    return JSON.parse(localStorage.getItem('userNotifications') || '[]');
  }

  // Mark notification as read
  static markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('notificationRead', { detail: notificationId }));
  }

  // Mark all notifications as read
  static markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    
    window.dispatchEvent(new CustomEvent('allNotificationsRead'));
  }

  // Remove notification
  static removeNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    
    window.dispatchEvent(new CustomEvent('notificationRemoved', { detail: notificationId }));
  }

  // Get unread count
  static getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Clear all notifications
  static clearAllNotifications(): void {
    localStorage.removeItem('userNotifications');
    window.dispatchEvent(new CustomEvent('notificationsCleared'));
  }

  // Private helper methods
  private static addNotification(notification: any): void {
    const existingNotifications = this.getNotifications();
    const updatedNotifications = [notification, ...existingNotifications.slice(0, 49)];
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    
    window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
  }

  private static getTournamentNotificationTitle(type: string): string {
    switch (type) {
      case 'created':
        return 'Tournament Created';
      case 'joined':
        return 'Joined Tournament';
      case 'reminder':
        return 'Tournament Starting Soon';
      case 'result':
        return 'Tournament Results';
      default:
        return 'Tournament Update';
    }
  }

  private static getTournamentNotificationMessage(type: string, tournament: any): string {
    switch (type) {
      case 'created':
        return `${tournament.name} has been created successfully`;
      case 'joined':
        return `You have successfully joined ${tournament.name}`;
      case 'reminder':
        return `${tournament.name} starts in 1 hour`;
      case 'result':
        return `Results for ${tournament.name} are now available`;
      default:
        return `Update for ${tournament.name}`;
    }
  }
}

// Export default for easier imports
export default NotificationService;