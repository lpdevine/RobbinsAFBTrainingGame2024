import { useUnityContext } from "react-unity-webgl";
import { UnityProvider } from "react-unity-webgl/distribution/types/unity-provider";
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";




interface BuildContext{
  unityProvider: UnityProvider;
  sendMessage: (gameObjectName: string, methodName: string, parameter?: ReactUnityEventParameter) => void;
  addEventListener: (eventName: string, callback: (...parameters: ReactUnityEventParameter[]) => ReactUnityEventParameter) => void;
  removeEventListener: (eventName: string, callback: (...parameters: ReactUnityEventParameter[]) => ReactUnityEventParameter) => void;
}
function GetBuildContext(buildName:string) : BuildContext{

  const { unityProvider, sendMessage, addEventListener, removeEventListener  } = useUnityContext({
    loaderUrl:    "/" + buildName + "/UnityBuild.loader.js",
    dataUrl:      "/" + buildName + "/UnityBuild.data.unityweb",
    frameworkUrl: "/" + buildName + "/UnityBuild.framework.js.unityweb",
    codeUrl:      "/" + buildName + "/UnityBuild.wasm.unityweb",
  });

  const buildContext : BuildContext = { unityProvider: unityProvider, sendMessage: sendMessage, addEventListener: addEventListener, removeEventListener: removeEventListener }
  return buildContext;
}


export default GetBuildContext
