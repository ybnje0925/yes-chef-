export default function FoodArt({ kind }: { kind: string }) {
  return (
    <div className={`food-art ${kind}`} aria-hidden="true">
      <div className="plate">
        <div className="food">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <span className="food-shadow" />
    </div>
  );
}
