import PropTypes from "prop-types";
import { useEffect, useRef, useCallback } from "react";
import MetaMaskLogo from '@metamask/logo';
import { debounce } from "lodash";
import foxJson from "./fox.json";

const directionTargetGenerator = ({ top, left, height, width }) => {
  const horizontalMiddle = left + width / 2;
  const verticalMiddle = top + height / 2;
  return {
    up: { x: horizontalMiddle, y: top - height },
    down: { x: horizontalMiddle, y: top + height * 2 },
    left: { x: left - width, y: verticalMiddle },
    right: { x: left + width * 2, y: verticalMiddle },
    middle: { x: horizontalMiddle, y: verticalMiddle },
  };
};
export default function Mascot({
  animationEventEmitter,
  width = "200",
  height = "200",
  followMouse = true,
  lookAtTarget = {},
  lookAtDirection = null,
}) {
  const mascotContainer = useRef(null);
  const logoRef = useRef(null);
  const directionTargetMapRef = useRef(null);

  // initialize logo only once
  if (!logoRef.current) {
    logoRef.current = MetaMaskLogo({
      followMouse,
      pxNotRatio: true,
      width,
      height,
      meshJson: foxJson,
      verticalFieldOfView: Math.PI / 37.5,
      near: 100,
      far: 340,
    });

    const allowed = logoRef.current.container;
    document.querySelectorAll("body > svg").forEach((node) => {
      if (node !== allowed && !allowed.contains(node)) {
        node.remove();
      }
    });    
  }

  const logo = logoRef.current;

  const unfollowMouse = useCallback(() => {
    logo.setFollowMouse(false);
  }, [logo]);

  const refollowMouse = useCallback(
    debounce(() => {
      logo.setFollowMouse(true);
    }, 1000),
    [logo]
  );

  const lookAt = useCallback(
    (target) => {
      unfollowMouse();
      logo.lookAtAndRender(target);
      refollowMouse();
    },
    [logo, unfollowMouse, refollowMouse]
  );

  // Setup event listeners
  useEffect(() => {
    animationEventEmitter.on("point", lookAt);
    animationEventEmitter.on("setFollowMouse", logo.setFollowMouse.bind(logo));

    return () => {
      animationEventEmitter.removeAllListeners();
    };
  }, [animationEventEmitter, logo, lookAt]);

  // Mount & initial lookAt
  useEffect(() => {
    if (mascotContainer.current && !mascotContainer.current.contains(logo.container)) {
      mascotContainer.current.appendChild(logo.container);
      directionTargetMapRef.current = directionTargetGenerator(
        mascotContainer.current.getBoundingClientRect()
      );
    }

    if (lookAtTarget?.x && lookAtTarget?.y) {
      logo.lookAtAndRender(lookAtTarget);
    } else if (lookAtDirection && directionTargetMapRef.current) {
      logo.lookAtAndRender(directionTargetMapRef.current[lookAtDirection]);
    }

    return () => {
      logo.container.remove();
      logo.stopAnimation();
    };
  }, [logo, lookAtTarget, lookAtDirection]);

  // Handle updates
  useEffect(() => {
    if (lookAtDirection && directionTargetMapRef.current) {
      logo.lookAtAndRender(directionTargetMapRef.current[lookAtDirection]);
    } else if (lookAtTarget?.x && lookAtTarget?.y) {
      logo.lookAtAndRender(lookAtTarget);
    }

    if (followMouse) {
      refollowMouse();
    } else {
      unfollowMouse();
    }
  }, [lookAtTarget, lookAtDirection, followMouse, logo, refollowMouse, unfollowMouse]);

  return <div ref={mascotContainer} style={{ zIndex: 0 }} />;
}

Mascot.propTypes = {
  animationEventEmitter: PropTypes.object.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  followMouse: PropTypes.bool,
  lookAtTarget: PropTypes.object,
  lookAtDirection: PropTypes.oneOf(["up", "down", "left", "right", "middle"]),
};
