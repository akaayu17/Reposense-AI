useEffect(() => { if (isRepoLoaded && !summary) loadSummary(); }, [isRepoLoaded]);
