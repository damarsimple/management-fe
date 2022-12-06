import React, { useEffect, PropsWithChildren, useState, ReactNode } from "react";


const BrowserOnly = ({ children }: PropsWithChildren) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return <React.Fragment>
        {hasMounted ? children : null}
    </React.Fragment>
}

export default BrowserOnly;