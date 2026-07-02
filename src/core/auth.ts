export interface AuthCredentials {
  projectToken: string
  origin: string
}

export class AuthManager {
  private credentials: AuthCredentials

  constructor(projectToken: string, origin: string) {
    this.credentials = { projectToken, origin }
  }

  getProjectToken(): string {
    return this.credentials.projectToken
  }

  getOrigin(): string {
    return this.credentials.origin
  }

  setProjectToken(token: string): void {
    this.credentials.projectToken = token
  }

  setOrigin(origin: string): void {
    this.credentials.origin = origin
  }

  getSocketAuth(): { project_token: string; origin: string } {
    return {
      project_token: this.credentials.projectToken,
      origin: this.credentials.origin,
    }
  }

  getHttpHeaders(): Record<string, string> {
    return {
      project_token: this.credentials.projectToken,
      origin: this.credentials.origin,
    }
  }
}
