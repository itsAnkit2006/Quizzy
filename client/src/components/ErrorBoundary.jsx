import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error(
            "Quizzy application error:",
            error
        );

        console.error(
            "Component error information:",
            errorInfo
        );
    }

    handleReload = () => {
        window.location.reload();
    };

    handleHome = () => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
                    <div className="w-full max-w-md text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-bold text-red-600">
                            !
                        </div>

                        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                            Something went wrong
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Quizzy ran into an unexpected problem.
                            You can try reloading the page or return
                            to the home page.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Reload Page
                            </button>

                            <button
                                type="button"
                                onClick={this.handleHome}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Go Home
                            </button>

                        </div>

                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;