const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const label = () => {
    const date = toolbar.date;
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
  };

  return (
    <div className="rbc-toolbar">
      <button type="button" onClick={goToBack}>
        前
      </button>
      <span className="rbc-toolbar-label">{label()}</span>
      <button type="button" onClick={goToNext}>
        次
      </button>
    </div>
  );
};

export default CustomToolbar;
