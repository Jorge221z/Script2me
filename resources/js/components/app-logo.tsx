import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center">
            <div className="
                bg-sidebar-primary
                text-sidebar-primary-foreground
                flex
                aspect-square
                size-10
                items-center
                justify-center
                rounded-xl
                overflow-visible
                p-0
            ">
                <AppLogoIcon className="
                    size-full
                    fill-current
                    text-white
                    dark:text-black
                " />
            </div>
            <div className="ml-3 grid flex-1 text-left">
                <span className="text-xl font-semibold leading-none">
                    script2me
                </span>
            </div>
        </div>
    );
}
