import { withRouter } from "react-router-dom";
import { useEffect } from "react";

const ScrollToTop = ({ children, history }: any) => {
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    };
  }, [history]);

  return children;
};

export default withRouter(ScrollToTop);
