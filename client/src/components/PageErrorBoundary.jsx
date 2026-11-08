import { Component } from "react";
import { reportError } from "../lib/errors.js";
import { PageFailed } from "../pages/ErrorPage";

/**
 * Shows the plain-words error page when a page throws while rendering, and sends
 * the original error to GlitchTip. App keys it by path, so moving to another
 * page clears it.
 */
class PageErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    reportError(error, {
      code: "render_failed",
      url: window.location.pathname,
      componentStack: info.componentStack,
    });
  }

  render() {
    return this.state.failed ? <PageFailed /> : this.props.children;
  }
}

export default PageErrorBoundary;
