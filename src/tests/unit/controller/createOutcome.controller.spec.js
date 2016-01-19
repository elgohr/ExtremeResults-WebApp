(function () {
    'use strict';

    describe('CreateOutcome controller', function(){

        var ParseServiceMock,
            AuthServiceMock,
            userMock,
            controller,
            rootScope,
            location,
            formattedEntryDateMock,
            entryHeaderMock,
            outcomeTypeMock,
            relatedEntriesDeferred,
            XrUtilsMock,
            q;

        beforeEach(module('xr.createOutcome'));
        beforeEach(module(function ($provide) {
            ParseServiceMock = {
                postObject: function () {},
                callFunction: function () {}
            };

            outcomeTypeMock = {
                className: 'Outcome',
                typeName: 'Daily'
            };

            userMock = {
                objectId: '1234'
            };
            AuthServiceMock = {
                getCurrentUser: function () {
                    return userMock;
                },
                getUserToken: function () {
                    return '1234';
                }
            };

            formattedEntryDateMock = 'mockymockmockdate';
            entryHeaderMock = 'headheadheader';
            XrUtilsMock = {
                getFormattedEntryDate: function () { return formattedEntryDateMock },
                getEntryHeader: function () { return entryHeaderMock }
            };

            $provide.value('ParseService', ParseServiceMock);
            $provide.value('outcomeType', outcomeTypeMock);
            $provide.value('XrUtils', XrUtilsMock);
            $provide.value('AuthService', AuthServiceMock);
        }));
        beforeEach(inject(function($controller, $q, $rootScope, $location) {
            q = $q;
            location = $location;
            rootScope = $rootScope;

            relatedEntriesDeferred = q.defer();
            spyOn(ParseServiceMock, 'callFunction').and.returnValue(relatedEntriesDeferred.promise);

            controller = $controller('CreateOutcomeController', {'$location': location});
        }));

        describe('init', function () {
            it('should get related entries', function () {
                var relatedEntries = [{test: 1}];

                relatedEntriesDeferred.resolve(relatedEntries);
                rootScope.$digest();

                expect(ParseServiceMock.callFunction).toHaveBeenCalledWith('getRelatedEntriesForOutcome', {typeName: outcomeTypeMock.typeName}, AuthServiceMock.getUserToken());
                expect(controller.relatedEntries).toBe(relatedEntries);
            });
        });

        describe('save method', function () {
            var deferred;

            beforeEach(function () {
                deferred = q.defer();
                spyOn(ParseServiceMock, 'postObject').and.returnValue(deferred.promise);

                controller.createOutcomeForm = {
                    '$someAngularThing': {},
                    'outcome1': { $pristine: true, $valid: true, $setDirty: function() {} },
                    'outcome2': { $pristine: true, $valid: true, $setDirty: function() {} },
                    'outcome3': { $pristine: true, $valid: true, $setDirty: function() {} },
                    $valid: true,
                    $setPristine: function () {}
                }
            });

            it('should not save anything when form is invalid', function () {
                controller.createOutcomeForm.$valid = false;

                controller.save();

                expect(ParseServiceMock.postObject).not.toHaveBeenCalled();
            });

            it('should save to outcomeType className', function () {
                controller.save();

                expect(ParseServiceMock.postObject.calls.mostRecent().args[0]).toBe(outcomeTypeMock.className);
            });

            it('should save outcomeType', function () {
                controller.save();

                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].typeName).toBeDefined();
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].typeName).toBe(outcomeTypeMock.typeName);
            });

            it('should save all stories', function () {
                controller.outcome1 = "Test1";
                controller.outcome2 = "Test2";
                controller.outcome3 = "Test3";

                controller.save();

                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].firstStory).toBeDefined();
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].firstStory).toBe(controller.outcome1);
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].secondStory).toBeDefined();
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].secondStory).toBe(controller.outcome2);
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].thirdStory).toBeDefined();
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].thirdStory).toBe(controller.outcome3);
            });

            it('should set ACL', function () {
                controller.outcome1 = "Test1";
                controller.outcome2 = "Test2";
                controller.outcome3 = "Test3";

                controller.save();

                var expectedACL = {
                    "*": { }
                };
                expectedACL[userMock.objectId] = {
                    "read": true,
                    "write": true
                };
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].ACL).toBeDefined();
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].ACL).toEqual(expectedACL);
            });

            it('should save the date as ISO 8601 String', function () {
                controller.save();

                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].effectiveDate).toBeDefined();
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].effectiveDate.__type).toBe('Date');
                expect(ParseServiceMock.postObject.calls.mostRecent().args[1].effectiveDate.iso).toMatch("[0-9]{4}-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9]{3}Z");
            });

            describe('finished', function () {
                beforeEach(function () {
                    controller.save();
                });

                it('should change location to overview on post success', function () {
                    spyOn(location, 'path');

                    deferred.resolve();
                    rootScope.$digest();

                    expect(location.path).toHaveBeenCalledWith('overview');
                });
            });
        });

        describe('header', function () {
            it('should have entryheader and date', function () {
                expect(controller.header).toBe(entryHeaderMock + ' for ' + formattedEntryDateMock);
            });
        });

    });
})();