import { Component } from 'react';
import { confirmWebGL } from '../hooks/useDeviceTier';

/**
 * Guards a 3D scene: confirms WebGL really works before the scene mounts (so a missing GPU never
 * produces renderer errors), and catches a scene that still fails to start (lost context, out of
 * memory) so the rest of the page keeps working. Renders `fallback` instead.
 */
export default class SceneBoundary extends Component {
  state = { failed: !confirmWebGL() };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.warn('3D scene disabled:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}
