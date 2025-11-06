
import {Sublist} from "@/components/sub-list/SubList.tsx";
import type {CardBaseProps} from "@/ui/card/CardBase.tsx";


function App() {

    const subscriptions: CardBaseProps[] = [
        {
            title: 'Подписка 1',
            subtitle: 'Описание подписки 1',
            avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        },
        {
            title: 'Подписка 2',
            subtitle: 'Описание подписки 2',
            avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        },
        {
            title: 'Подписка 3',
            subtitle: 'Описание подписки 3',
            avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg',
        },
    ];


    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5rem',
                paddingTop: '5rem',
                paddingBottom: '5rem',
            }}>
            <Sublist
                items={subscriptions}
            />


            {/*<NextEvent*/}
            {/*    title="Вечеринка у друзей"*/}
            {/*    date="10 ноября, 19:00"*/}
            {/*    onAttend={() => console.log("Пойду")}*/}
            {/*    onDetails={() => console.log("Подробнее")}*/}
            {/*/>*/}
        </div>
        // <Router>
        //     <Routes>
        //         <Route
        //             path="/s"
        //             element={
        //                 <Button >
        //                     Button
        //                 </Button>
        //             }
        //         />
        //         <Route path="/d" element={<TextField label='пример' helperText = 'ddd' error={true}/>}/>
        //         <Route path="/as" element={<TextArea label='Поле' helperText = 'ddd' />}/>
        //         <Route path="/" element={<Select label='Поле' helperText = 'ddd' />}/>
        //     </Routes>
        // </Router>
    );
}

export default App;
