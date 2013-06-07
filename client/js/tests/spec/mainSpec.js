define('spec/main', ['app/main'], function (priv) {

    describe("SecondScreen", function () {

        it("should return true", function () {
            expect(priv._formatDuration(12)).toEqual('12 seconds');
        });

    });
});