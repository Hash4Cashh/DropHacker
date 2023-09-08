import { LoaderCenter } from "@components/loaderCenter";
import SpinnerCenter from "@components/spinnerCenter";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    // return <LoaderCenter/>
    return <div className="container-center"><SpinnerCenter/></div>
  }