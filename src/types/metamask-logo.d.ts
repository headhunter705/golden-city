declare module '@metamask/logo' {
  interface MetaMaskLogoOptions {
    followMouse?: boolean;
    pxNotRatio?: boolean;
    width?: string | number;
    height?: string | number;
    meshJson?: any;
    verticalFieldOfView?: number;
    near?: number;
    far?: number;
  }

  interface MetaMaskLogoInstance {
    container: HTMLElement;
    setFollowMouse: (follow: boolean) => void;
    lookAtAndRender: (target: { x: number; y: number }) => void;
    stopAnimation: () => void;
  }

  function MetaMaskLogo(options: MetaMaskLogoOptions): MetaMaskLogoInstance;
  export = MetaMaskLogo;
}
