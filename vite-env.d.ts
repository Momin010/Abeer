declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    group: any;
    mesh: any;
    cylinderGeometry: any;
    meshStandardMaterial: any;
    sphereGeometry: any;
    pointLight: any;
    meshPhysicalMaterial: any;
    coneGeometry: any;
    meshBasicMaterial: any;
    fog: any;
    ambientLight: any;
    directionalLight: any;
  }
}